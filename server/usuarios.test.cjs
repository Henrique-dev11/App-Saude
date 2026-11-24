const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { createUserStore } = require('./usuarios.cjs');
const { validarCadastro } = require('../src/services/validarUsuario');

const dados = (email = 'ana@example.com') => ({ nome: 'Ana Silva', email, idade: '29', tipoSanguineo: 'A+',
    peso: '65,5', altura: '170', senha: 'Exemplo123', confirmarSenha: 'Exemplo123' });
const perfil = usuario => { const { id, ...value } = usuario; return value; };
const foto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=';

test('Cadastro, sessão e perfil persistem ao reabrir o banco, sem senha ou token em texto puro', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'saude-user-'));
    const databasePath = join(dir, 'usuarios.sqlite');
    let store = createUserStore({ databasePath });
    try {
        const session = await store.cadastrar(dados('  ANA@example.com '));
        assert.equal(session.usuario.email, 'ana@example.com');
        assert.equal(session.usuario.peso, 65.5);
        assert.equal(session.usuario.altura, 170);
        assert.equal(session.usuario.senha, undefined);
        store.close();
        store = createUserStore({ databasePath });
        assert.deepEqual(store.perfil(session.token), session.usuario);
        const db = new DatabaseSync(databasePath);
        const row = db.prepare('SELECT senha_hash FROM usuarios').get();
        assert.ok(row.senha_hash.startsWith('scrypt$32768$8$3$'));
        assert.ok(!row.senha_hash.includes(dados().senha));
        assert.notEqual(db.prepare('SELECT token_hash FROM sessoes').get().token_hash, session.token);
        db.close();
    } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('Atualiza todos os campos e foto, mantém dados após falhas e permite remover a foto', async () => {
    const store = createUserStore({ databasePath: ':memory:' });
    try {
        const { token, usuario } = await store.cadastrar(dados());
        const changes = { ...perfil(usuario), nome: 'Ana Souza', email: 'nova@example.com', idade: 30,
            tipoSanguineo: 'AB-', peso: 70.25, altura: 172.5, foto };
        const saved = store.atualizar(token, changes);
        assert.deepEqual(saved, { id: usuario.id, ...changes, versao: 2 });
        assert.throws(() => store.atualizar(token, { ...perfil(saved), peso: 0 }), /peso/);
        assert.deepEqual(store.perfil(token), saved);
        assert.throws(() => store.atualizar(token, changes), error => error.code === 'PROFILE_CONFLICT');
        assert.equal(store.atualizar(token, { ...perfil(saved), foto: null }).foto, null);
        assert.throws(() => store.atualizar(token, { ...perfil(store.perfil(token)), foto: 'data:image/svg+xml;base64,AAAA' }), /foto/);
        await assert.rejects(store.entrar({ email: 'ana@example.com', senha: dados().senha }), /inválidos/);
        assert.equal((await store.entrar({ email: 'nova@example.com', senha: dados().senha })).usuario.nome, 'Ana Souza');
    } finally { store.close(); }
});

test('Duplicatas e IDs de outra conta não permitem alterar o usuário errado', async () => {
    const store = createUserStore({ databasePath: ':memory:' });
    try {
        const ana = await store.cadastrar(dados());
        const bia = await store.cadastrar({ ...dados('bia@example.com'), nome: 'Bia Lima' });
        await assert.rejects(store.cadastrar(dados('ANA@EXAMPLE.COM')), error => error.code === 'EMAIL_IN_USE');
        assert.throws(() => store.atualizar(ana.token, { ...perfil(ana.usuario), email: bia.usuario.email }), error => error.code === 'EMAIL_IN_USE');
        assert.throws(() => store.atualizar(ana.token, { ...perfil(ana.usuario), id: bia.usuario.id }), /apenas/);
        assert.equal(store.perfil(bia.token).nome, 'Bia Lima');
        assert.equal(store.perfil(ana.token).email, 'ana@example.com');
        assert.throws(() => store.perfil('inventado'), error => error.status === 401);
    } finally { store.close(); }
});

test('Troca segura de senha valida senha atual, rotaciona sessão e revoga outras sessões', async () => {
    const store = createUserStore({ databasePath: ':memory:' });
    try {
        const first = await store.cadastrar(dados());
        const second = await store.entrar({ email: dados().email, senha: dados().senha });
        await assert.rejects(store.alterarSenha(first.token, { senhaAtual: 'Errada123', novaSenha: 'NovaSenha456' }), /senha atual/);
        assert.equal(store.perfil(first.token).email, dados().email);
        const changed = await store.alterarSenha(first.token, { senhaAtual: dados().senha, novaSenha: 'NovaSenha456' });
        assert.notEqual(changed.token, first.token);
        assert.throws(() => store.perfil(first.token), error => error.status === 401);
        assert.throws(() => store.perfil(second.token), error => error.status === 401);
        await assert.rejects(store.entrar({ email: dados().email, senha: dados().senha }), /inválidos/);
        const logged = await store.entrar({ email: dados().email, senha: 'NovaSenha456' });
        store.sair(logged.token);
        assert.throws(() => store.perfil(logged.token), error => error.status === 401);
        assert.equal(store.perfil(changed.token).nome, 'Ana Silva');
    } finally { store.close(); }
});

for (const [campo, valor] of [['nome', ''], ['email', 'invalido'], ['idade', '29.5'], ['idade', 131],
    ['tipoSanguineo', 'C+'], ['peso', -5], ['altura', '0'], ['senha', 'curta'], ['confirmarSenha', 'diferente']]) {
    test('Validação de cadastro: ' + campo + '=' + valor, () => {
        assert.throws(() => validarCadastro({ ...dados(), [campo]: valor }), error => error.status === 400);
    });
}

test('Alergia informada no cadastro aparece no perfil e persiste após reabrir o banco', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'saude-alergia-'));
    const databasePath = join(dir, 'usuarios.sqlite');
    let store = createUserStore({ databasePath });
    try {
        const sessao = await store.cadastrar({ ...dados(), tipoAlergia: '  Dipirona,   amendoim  ' });
        assert.equal(sessao.usuario.tipoAlergia, 'Dipirona, amendoim');
        store.close(); store = createUserStore({ databasePath });
        assert.equal(store.perfil(sessao.token).tipoAlergia, 'Dipirona, amendoim');
        const atual = store.perfil(sessao.token);
        const { id, ...campos } = atual;
        const editado = store.atualizar(sessao.token, { ...campos, tipoAlergia: 'Poeira' });
        assert.equal(editado.tipoAlergia, 'Poeira');
        const { tipoAlergia, ...clienteAntigo } = editado;
        delete clienteAntigo.id;
        assert.equal(store.atualizar(sessao.token, clienteAntigo).tipoAlergia, 'Poeira');
        const removido = store.atualizar(sessao.token, { ...campos, versao: 3, tipoAlergia: '' });
        assert.equal(removido.tipoAlergia, '');
    } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('Campo de alergia é opcional e rejeita valores inválidos ou longos demais', () => {
    assert.equal(validarCadastro(dados()).tipoAlergia, '');
    assert.equal(validarCadastro({ ...dados(), tipoAlergia: 'Nenhuma conhecida' }).tipoAlergia, 'Nenhuma conhecida');
    for (const tipoAlergia of [123, {}, [], 'a'.repeat(301)]) {
        assert.throws(() => validarCadastro({ ...dados(), tipoAlergia }), /alergia/);
    }
});

test('Migra banco anterior sem o campo de alergia e preserva a sessão existente', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'saude-migracao-alergia-'));
    const databasePath = join(dir, 'usuarios.sqlite');
    let store = createUserStore({ databasePath });
    try {
        const sessao = await store.cadastrar(dados());
        store.close();
        const antigo = new DatabaseSync(databasePath);
        antigo.exec('ALTER TABLE usuarios DROP COLUMN tipo_alergia'); antigo.close();
        store = createUserStore({ databasePath });
        const perfilMigrado = store.perfil(sessao.token);
        assert.equal(perfilMigrado.nome, sessao.usuario.nome);
        assert.equal(perfilMigrado.tipoAlergia, '');
        assert.equal(perfilMigrado.versao, sessao.usuario.versao);
    } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

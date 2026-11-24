const { DatabaseSync } = require('node:sqlite');
const { mkdirSync, chmodSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { validarDadosPessoais, validarCadastro, validarSenha, normalizarEmail } = require('../src/services/validarUsuario');

const { validarMedicao } = require('../src/services/dadosMedicoes');

const derivar = promisify(scrypt);
const DURACAO_SESSAO = 30 * 24 * 60 * 60 * 1000;
const parametros = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const hashToken = token => createHash('sha256').update(token).digest('hex');
const erro = (message, status = 400, code = 'VALIDATION_ERROR') => Object.assign(new Error(message), { status, code });

async function protegerSenha(senha) {
    const salt = randomBytes(16).toString('hex');
    const hash = await derivar(senha, salt, 64, parametros);
    return 'scrypt$32768$8$3$' + salt + '$' + hash.toString('hex');
}

async function conferirSenha(senha, protegido) {
    const partes = protegido.split('$');
    const hash = await derivar(senha, partes[4], 64, parametros);
    const esperado = Buffer.from(partes[5], 'hex');
    return hash.length === esperado.length && timingSafeEqual(hash, esperado);
}

function usuarioPublico(row) {
    return { id: row.id, nome: row.nome, email: row.email, idade: row.idade,
        tipoSanguineo: row.tipo_sanguineo, peso: row.peso, altura: row.altura,
        foto: row.foto, tipoAlergia: row.tipo_alergia || '', versao: row.versao };
}

function validarFoto(foto) {
    if (foto === null) return null;
    if (typeof foto !== 'string') throw erro('Escolha uma foto válida.');
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(foto);
    if (!match || match[2].length > 2800000) throw erro('Use uma foto JPEG, PNG ou WebP com até 2 MB.');
    const bytes = Buffer.from(match[2], 'base64');
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (bytes.length > 2 * 1024 * 1024 || !({ jpeg, png, webp })[match[1]]) throw erro('A foto selecionada está inválida ou excede 2 MB.');
    return foto;
}

function createUserStore({ databasePath = process.env.AUTH_DB_PATH || join(__dirname, '.data', 'usuarios.sqlite'), now = Date.now } = {}) {
    if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    const db = new DatabaseSync(databasePath);
    if (databasePath !== ':memory:') chmodSync(databasePath, 0o600);
    db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
        CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            senha_hash TEXT NOT NULL, idade INTEGER NOT NULL, tipo_sanguineo TEXT NOT NULL,
            peso REAL NOT NULL, altura REAL NOT NULL, foto TEXT, tipo_alergia TEXT NOT NULL DEFAULT '', versao INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS sessoes (
            token_hash TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            expira_em INTEGER NOT NULL
        ); CREATE INDEX IF NOT EXISTS sessoes_usuario ON sessoes(usuario_id);
        CREATE TABLE IF NOT EXISTS medicoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            tipo TEXT NOT NULL, valor REAL NOT NULL, diastolica INTEGER,
            contexto TEXT, data TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS medicoes_usuario_tipo ON medicoes(usuario_id, tipo, data);`);
    // Migração aditiva para contas já cadastradas: preserva perfis e sessões.
    if (!db.prepare('PRAGMA table_info(usuarios)').all().some(coluna => coluna.name === 'tipo_alergia')) {
        db.exec("ALTER TABLE usuarios ADD COLUMN tipo_alergia TEXT NOT NULL DEFAULT ''");
    }
    const porId = id => db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
    const porEmail = email => db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    function transacao(run) {
        db.exec('BEGIN IMMEDIATE');
        try { const value = run(); db.exec('COMMIT'); return value; }
        catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    function iniciarSessao(id) {
        const token = randomBytes(32).toString('base64url');
        const expiraEm = now() + DURACAO_SESSAO;
        db.prepare('DELETE FROM sessoes WHERE expira_em <= ?').run(now());
        db.prepare('INSERT INTO sessoes VALUES (?, ?, ?)').run(hashToken(token), id, expiraEm);
        return { token, expiraEm, usuario: usuarioPublico(porId(id)) };
    }
    function autenticar(token) {
        if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw erro('Sua sessão expirou. Entre novamente.', 401, 'UNAUTHENTICATED');
        const row = db.prepare('SELECT usuario_id FROM sessoes WHERE token_hash = ? AND expira_em > ?').get(hashToken(token), now());
        if (!row) throw erro('Sua sessão expirou. Entre novamente.', 401, 'UNAUTHENTICATED');
        return porId(row.usuario_id);
    }
    return {
        async cadastrar(data) {
            const usuario = validarCadastro(data);
            if (porEmail(usuario.email)) throw erro('Já existe uma conta com este e-mail.', 409, 'EMAIL_IN_USE');
            const protegido = await protegerSenha(data.senha);
            return transacao(() => {
                if (porEmail(usuario.email)) throw erro('Já existe uma conta com este e-mail.', 409, 'EMAIL_IN_USE');
                const id = randomUUID();
                db.prepare('INSERT INTO usuarios (id,nome,email,senha_hash,idade,tipo_sanguineo,peso,altura,tipo_alergia) VALUES (?,?,?,?,?,?,?,?,?)')
                    .run(id, usuario.nome, usuario.email, protegido, usuario.idade, usuario.tipoSanguineo, usuario.peso, usuario.altura, usuario.tipoAlergia);
                return iniciarSessao(id);
            });
        },
        async entrar(data) {
            const usuario = porEmail(normalizarEmail(data?.email));
            const senha = typeof data?.senha === 'string' && data.senha.length <= 128 ? data.senha : '';
            // Mantém o trabalho de derivação mesmo para e-mail não cadastrado.
            const protegido = usuario?.senha_hash || 'scrypt$32768$8$3$' + '0'.repeat(32) + '$' + '0'.repeat(128);
            const confere = await conferirSenha(senha, protegido);
            if (!usuario || !confere || porId(usuario.id)?.senha_hash !== usuario.senha_hash) {
                throw erro('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
            }
            return iniciarSessao(usuario.id);
        },
        perfil(token) { return usuarioPublico(autenticar(token)); },
        atualizar(token, data) {
            const atual = autenticar(token);
            const campos = ['nome', 'email', 'idade', 'tipoSanguineo', 'peso', 'altura', 'tipoAlergia', 'foto', 'versao'];
            if (Object.keys(data).some(key => !campos.includes(key))) throw erro('Envie apenas as informações do seu perfil.');
            const usuario = validarDadosPessoais(data);
            if (data.versao !== atual.versao) throw erro('Seu perfil foi atualizado em outro lugar. Recarregue os dados antes de salvar.', 409, 'PROFILE_CONFLICT');
            const duplicado = porEmail(usuario.email);
            if (duplicado && duplicado.id !== atual.id) throw erro('Já existe uma conta com este e-mail.', 409, 'EMAIL_IN_USE');
            const foto = Object.hasOwn(data, 'foto') ? validarFoto(data.foto) : atual.foto;
            const tipoAlergia = Object.hasOwn(data, 'tipoAlergia') ? usuario.tipoAlergia : atual.tipo_alergia;
            db.prepare('UPDATE usuarios SET nome=?, email=?, idade=?, tipo_sanguineo=?, peso=?, altura=?, foto=?, tipo_alergia=?, versao=versao+1 WHERE id=?')
                .run(usuario.nome, usuario.email, usuario.idade, usuario.tipoSanguineo, usuario.peso, usuario.altura, foto, tipoAlergia, atual.id);
            return usuarioPublico(porId(atual.id));
        },
        async alterarSenha(token, data) {
            const atual = autenticar(token);
            validarSenha(data.novaSenha);
            if (typeof data.senhaAtual !== 'string' || data.senhaAtual.length > 128 || !await conferirSenha(data.senhaAtual, atual.senha_hash)) {
                throw erro('A senha atual está incorreta.', 400, 'INVALID_CURRENT_PASSWORD');
            }
            if (data.novaSenha === data.senhaAtual) throw erro('A nova senha deve ser diferente da senha atual.');
            const protegido = await protegerSenha(data.novaSenha);
            return transacao(() => {
                // Revalida a sessão após o trabalho assíncrono de senha.
                const vigente = autenticar(token);
                if (vigente.senha_hash !== atual.senha_hash) throw erro('A senha já foi alterada. Entre novamente.', 401, 'UNAUTHENTICATED');
                db.prepare('UPDATE usuarios SET senha_hash=? WHERE id=?').run(protegido, atual.id);
                db.prepare('DELETE FROM sessoes WHERE usuario_id=?').run(atual.id);
                return iniciarSessao(atual.id);
            });
        },
        sair(token) { autenticar(token); db.prepare('DELETE FROM sessoes WHERE token_hash=?').run(hashToken(token)); },
        listarMedicoes(token, tipo) {
            const usuario = autenticar(token);
            if (!['pressao', 'glicemia'].includes(tipo)) throw erro('Tipo de medição inválido.');
            return db.prepare('SELECT id,tipo,valor,diastolica,contexto,data FROM medicoes WHERE usuario_id=? AND tipo=? ORDER BY data,id').all(usuario.id, tipo);
        },
        salvarMedicao(token, data) {
            const usuario = autenticar(token);
            let medicao;
            try { medicao = validarMedicao(data, now()); }
            catch (error) { throw erro(error.message); }
            const { tipo, valor, diastolica, contexto, data: instante } = medicao;
            const result = db.prepare('INSERT INTO medicoes (usuario_id,tipo,valor,diastolica,contexto,data) VALUES (?,?,?,?,?,?)')
                .run(usuario.id, tipo, valor, diastolica, contexto, instante);
            return { id: Number(result.lastInsertRowid), ...medicao };
        },
        close() { db.close(); },
    };
}

module.exports = { createUserStore, DURACAO_SESSAO };

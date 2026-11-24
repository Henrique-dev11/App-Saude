function falhaDeConexao(error) {
    const code = error?.cause?.code || error?.code;
    return ['ERR_NETWORK', 'ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH',
        'EHOSTUNREACH', 'ECONNREFUSED', 'ECONNRESET'].includes(code);
}

module.exports = { falhaDeConexao };

'use strict';

function evaluateTizenTokenMessage(message, expectedToken) {
    if (!message || typeof message !== 'object') {
        return null;
    }
    if (
        message.event === 'ms.channel.timeOut' ||
        message.event === 'ms.channel.unauthorized' ||
        message.event === 'ms.channel.error'
    ) {
        return { accepted: false, error: `Tizen WS denied: ${message.event}` };
    }
    if (message.event === 'ms.error') {
        return { accepted: false, error: 'Tizen error during token verification' };
    }
    if (message.event !== 'ms.channel.connect' && message.event !== 'ms.channel.ready') {
        return null;
    }
    const returnedToken = message?.data?.token || message?.data?.data?.token || '';
    if (returnedToken && returnedToken !== expectedToken) {
        return { accepted: false, error: 'TV returned a different token' };
    }
    return { accepted: true };
}

module.exports = { evaluateTizenTokenMessage };

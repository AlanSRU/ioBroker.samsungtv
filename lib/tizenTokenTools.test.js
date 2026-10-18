'use strict';

const assert = require('node:assert/strict');
const { evaluateTizenTokenMessage } = require('./tizenTokenTools');

describe('Tizen token validation', () => {
    it('accepts a successful channel connection with the expected token', () => {
        assert.deepEqual(evaluateTizenTokenMessage({ event: 'ms.channel.connect', data: { token: '1234' } }, '1234'), {
            accepted: true,
        });
        assert.deepEqual(evaluateTizenTokenMessage({ event: 'ms.channel.ready' }, '1234'), { accepted: true });
    });

    it('rejects authorization failures and a different returned token', () => {
        assert.deepEqual(evaluateTizenTokenMessage({ event: 'ms.channel.unauthorized' }, '1234'), {
            accepted: false,
            error: 'Tizen WS denied: ms.channel.unauthorized',
        });
        assert.deepEqual(evaluateTizenTokenMessage({ event: 'ms.channel.connect', data: { token: '5678' } }, '1234'), {
            accepted: false,
            error: 'TV returned a different token',
        });
    });

    it('ignores unrelated messages without exposing the expected token', () => {
        assert.equal(evaluateTizenTokenMessage({ event: 'ed.unknown', data: { token: '1234' } }, '1234'), null);
        const result = evaluateTizenTokenMessage({ event: 'ms.error', data: { message: 'denied' } }, '1234');
        assert.equal(JSON.stringify(result).includes('1234'), false);
        assert.deepEqual(result, { accepted: false, error: 'Tizen error during token verification' });
    });
});

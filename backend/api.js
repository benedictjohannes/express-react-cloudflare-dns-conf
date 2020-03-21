const https = require('https');
const express = require('express');
const router = express.Router();
const logger = require('morgan');
const cors = require('cors');
router.use(logger('dev'));
router.use(cors());

const {AUTH_EMAIL, AUTH_KEY, TARGET_ZONE} = process.env;

const makeReqOptions = (payload, id, query) => {
    const method = payload === false && id ? 'DELETE' : payload && id ? 'PUT' : payload && !id ? 'POST' : 'GET';
    const targetId = id ? '/' + id : '';
    const appendQuery = query ? query : '';
    return {
        method: method,
        hostname: 'api.cloudflare.com',
        path: `/client/v4/zones/${TARGET_ZONE}/dns_records${targetId}${appendQuery}`,
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Email': AUTH_EMAIL,
            'X-Auth-Key': AUTH_KEY,
        },
    };
};

const callRequest = (payload, id, query) => {
    return new Promise((resolve, reject) => {
        try {
            const stringifiedPayload = payload && JSON.stringify(payload);
            let theResult = '';
            const theRequest = https.request(makeReqOptions(payload, id, query), res => {
                res.on('data', chunk => {
                    theResult = theResult + chunk;
                });
                res.on('end', () => {
                    resolve(JSON.parse(theResult));
                });
            });
            if (payload) theRequest.write(stringifiedPayload);
            theRequest.on('error', err => reject(err));
            theRequest.end();
        } catch (err) {
            reject(err);
        }
    });
};

router.get('/', async (req, res) => {
    let {page} = req.query;
    let queryAppend = page ? `?page=${page}` : '';
    try {
        let cloudFlareAPIcallResult = await callRequest(false, undefined, queryAppend);
        res.json({error: false, data: cloudFlareAPIcallResult});
    } catch (err) {
        res.json({error: true, ...err});
    }
});

router.get('/:id', async (req, res) => {
    let {id} = req.params;
    try {
        let cloudFlareAPIcallResult = await callRequest(undefined, id);
        res.json({error: false, data: cloudFlareAPIcallResult});
    } catch (err) {
        res.json({error: true, ...err});
    }
});

router.put('/:id', async (req, res) => {
    let {body} = req;
    let {id} = req.params;
    try {
        let cloudFlareAPIcallResult = await callRequest(body, id);
        console.log(cloudFlareAPIcallResult);
        res.json(cloudFlareAPIcallResult);
    } catch (err) {
        res.json({error: true, ...err});
    }
});
router.delete('/:id', async (req, res) => {
    let {id} = req.params;
    try {
        let cloudFlareAPIcallResult = await callRequest(false, id);
        console.log(cloudFlareAPIcallResult);
        res.json(cloudFlareAPIcallResult);
    } catch (err) {
        res.json({error: true, ...err});
    }
});
router.post('/', async (req, res) => {
    let {body} = req;
    try {
        let cloudFlareAPIcallResult = await callRequest(body);
        console.log(cloudFlareAPIcallResult);
        res.json(cloudFlareAPIcallResult);
    } catch (err) {
        res.json({error: true, ...err});
    }
});

module.exports = router;

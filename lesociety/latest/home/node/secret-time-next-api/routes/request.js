const express = require('express');
const validation = require('../helpers/validation');
const requestController = require('../controllers/v1/request');
const validateApi = require('../helpers/validateApi');

const router = express.Router();

/* get all requests */
router.get('/', validateApi, requestController.getAllRequests);

/* get request statistics for inbox */
router.get('/stats', validateApi, requestController.getRequestStats);
router.get('/pending', validateApi, requestController.getPendingRequests);

/* Male request to Female only */
router.post('/send-request', validateApi, validation.validate('send-request'), requestController.sendRequest);
router.post('/accept', validateApi, validation.validate('request-action'), requestController.acceptRequest);
router.post('/reject', validateApi, validation.validate('request-action'), requestController.rejectRequest);
router.post('/ignore', validateApi, validation.validate('request-action'), requestController.ignoreRequest);


module.exports = router;

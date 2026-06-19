
const express = require('express');
const validation = require('../helpers/validation');
const validateApi = require('../helpers/validateApi');
const requireAdmin = require("../helpers/requireAdmin");
const dashboardController = require('../controllers/v1/dashboard');

const router = express.Router();

router.get('/registration', validateApi, validation.validate('dashboard'), dashboardController.registrationCompleted);
router.get('/geo-stats', validateApi, dashboardController.geoStats);

router.get('/total-users', validateApi, dashboardController.totalUsers);
router.get('/total-users-with-percentage', validateApi, dashboardController.newTotalUsersWithPercentage); // not used in application yet
router.get('/users-counts-with-percentage', validateApi, dashboardController.usersCountWithPercentage);
router.get('/users-counts-by-date', validateApi, validation.validate('users-counts-by-date'), dashboardController.usersCountByDate);
router.get('/subscription-analytics', validateApi, requireAdmin, dashboardController.subscriptionAnalytics);
router.get('/pricing-config', dashboardController.getPricingConfig);
router.put('/pricing-config', validateApi, requireAdmin, dashboardController.updatePricingConfig);

module.exports = router;

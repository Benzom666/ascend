const { createLogger } = require("../../lib/logger");
const logger = createLogger("dashboard");

/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const async = require("async");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const crypto = require("crypto");
const User = require("../../models/user");
const PricingConfig = require("../../models/pricing-config");
const helper = require("../../helpers/helper");
const {
  getDefaultPricingConfig,
  normalizePricingConfigPayload,
  mergePricingConfig,
} = require("../../lib/pricingConfig");
const { parse } = require("path");

// exports.registrationCompleted = async (req, res) => {
//     let {
//         gender = "male",
//         sort = "email",
//         order = 1,
//         status = 2,
//         start_date = new Date(),
//         end_date = new Date(),
//     } = req.query;

//     // Convert start_date and end_date to 'EST'
//     start_date = moment(start_date).tz("America/New_York").utc().startOf("day").toDate();
//     end_date = moment(end_date).tz("America/New_York").utc().endOf("day").toDate();
//     logger.debug(start_date, end_date, "==========================");
//     try {
//         const registrationStats = await User.aggregate([
//             {
//                 $match: {
//                     gender,
//                     status: +status,
//                     created_at: { $gte: start_date, $lte: end_date },
//                 },
//             },
//             {
//                 $group: {
//                     _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
//                     count: { $sum: 1 },
//                 },
//             },
//             {
//                 $sort: { _id: -1 },
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     created_at: { $toDate: "$_id" },
//                     count: 1,
//                 },
//             },
//         ]);

//         const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);
//         //logger.debug(dates)
//         res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
//     } catch (error) {
//         return res.status(500).json(helper.errorResponse([], 500, error));
//     }
// };

/*exports.registrationCompleted = async (req, res) => {
  let {
    gender = 'male',
    sort = 'email',
    order = 1,
    status = 2,
    start_date = new Date().toISOString(),
    end_date = new Date().toISOString()
  } = req.query;

  // Convert UTC to Canada Eastern Daylight Time (EDT, UTC-4)
  const offset = 4; // Adjust as needed for different parts of Canada
  const startDate = new Date(new Date(start_date).getTime() - offset*3600000);
  const endDate = new Date(new Date(end_date).getTime() - offset*3600000);

  try{
    const registrationStats = await User.aggregate([
      {
        $match: {
          gender,
          status: +status,
          created_at: { $gte: startDate, $lte: endDate },
          role: { $ne: 2 } // do not include admin users in stat
        },
      },
      {
        $group: {
          _id: {$dateToString:{format: "%Y-%m-%d", date: "$created_at"}},
          count: { $sum: 1 }
        }
      },
      {
        $sort : { _id : -1 }
      },
      {
        $project:  {
          _id: 0,
          created_at: { $toDate: "$_id", },
          count: 1,
       }
      },

    ]);

    const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
    res.status(200).json(helper.successResponse(dates, 200, 'Users registration stats.'));
  } catch(error) {
    return res.status(500).json(helper.errorResponse([], 500, error));
  }
};*/

/*exports.registrationCompleted = async (req, res) => {
  let {
    gender = 'male',
    sort = 'email',
    order = 1,
    status = 2
  } = req.body;

  // Set default values for start_date and end_date
  let start_date = req.body.start_date || moment().tz('America/Toronto').format();
  let end_date = req.body.end_date || moment().tz('America/Toronto').format();

  // Convert to JavaScript Date objects
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  try{
    const registrationStats = await User.aggregate([
      {
        $match: {
          gender,
          status: +status,
          created_At: { $gte: startDate, $lte: endDate }
        },
      },
      {
        $group: {
          _id: {$dateToString:{format: "%Y-%m-%d", date: "$created_At"}},
          count: { $sum: 1 }
        }
      },
      {
        $sort : { _id : -1 }
      },
      {
        $project:  {
          _id: 0,
          created_At: { $toDate: "$_id", },
          count: 1,
        }
      },
    ]);

    const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
    res.status(200).json(helper.successResponse(dates, 200, 'Users registration stats.'));
  } catch(error) {
    return res.status(500).json(helper.errorResponse([], 500, error));
  }
};*/

/*exports.registrationCompleted = async (req, res) => {
  let {
    gender = 'male',
    sort = 'email',
    order = 1,
    status = 2
  } = req.body;

  let start_date = req.body.start_date || moment().tz('America/Toronto').format();
  let end_date = req.body.end_date || moment().tz('America/Toronto').format();

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  try{
    const registrationStats = await User.aggregate([
      {
        $match: {
          gender,
          status: +status,
          created_at: { $gte: startDate, $lte: endDate }
        },
      },
      {
        $group: {
          _id: {$dateToString:{format: "%Y-%m-%d", date: "$created_at"}},
          count: { $sum: 1 }
        }
      },
      {
        $sort : { _id : -1 }
      },
      {
        $project:  {
          _id: 0,
          created_at: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S",
              date: { $toDate: "$_id" },
              timezone: 'America/Toronto'
            }
          },
          count: 1,
        }
      },
    ]);

    const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
    res.status(200).json(helper.successResponse(dates, 200, 'Users registration stats.'));
  } catch(error) {
    return res.status(500).json(helper.errorResponse([], 500, error));
  }
};*/
//const mongoose = require('mongoose');
//const moment = require('moment-timezone')
//const { Schema } = mongoose;

/*exports.registrationCompleted = async (req, res) => {
    let {
      gender = 'male',
      sort = 'email',
      order = 1,
      status = 2,
      start_date = moment().tz('Asia/Kolkata').format(),
      end_date = moment().tz('Asia/Kolkata').format()
    } = req.query;
  
    try {
      // Convert dates to JavaScript Date objects
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
  
      const registrationStats = await User.aggregate([
        {
          $match: {
            gender,
            status: +status,
            created_at: { $gte: startDate, $lte: endDate }
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $project: {
            _id: 0,
            created_at: { $toDate: "$_id" },
            count: 1,
          }
        },
      ]);
  
      // Ensure the helper function is working as expected
      const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
      res.status(200).json(helper.successResponse(dates, 200, 'Users registration stats.'));
    } catch (error) {
      return res.status(500).json(helper.errorResponse([], 500, error));
    }
  };*/
/*exports.registrationCompleted = async (req, res) => {
    let {
      gender = 'male',
      sort = 'email',
      order = 1,
      status = 2
    } = req.body;
  
    let start_date = req.body.start_date || moment().tz('America/Toronto').format();
    let end_date = req.body.end_date || moment().tz('America/Toronto').format();
  
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
  
    try{
/*      const registrationStats = await User.aggregate([
        {
          $match: {
            gender,
            status: +status,
            created_at: { $gte: startDate, $lte: endDate }
          },
        },
        {
          $group: {
            _id: {$dateToString:{format: "%Y-%m-%d", date: "$created_at"}},
            count: { $sum: 1 }
          }
        },
        {
          $sort : { _id : -1 }
        },
        {
          $project:  {
            _id: 0,
            created_at: '$_id',
            count: 1,
          }
        },
      ]);
  
const registrationStats = await User.aggregate([
  {
    $match: {
      gender,
      status: +status,
      created_at: { $gte: startDate, $lte: endDate }
    },
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d", 
          date: "$created_at", 
          timezone: 'America/Toronto'  // Adjust timezone here.
        }
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort : { _id : -1 }
  },
  {
    $project:  {
      _id: 0,
      created_at: {
        $dateToString: {
          format: "%Y-%m-%d %H:%M:%S",
          date: { $toDate: "$_id" },
          timezone: 'America/Toronto'  // Adjust timezone here.
        }
      },
      count: 1,
    }
  },
]);

      
    //  registrationStats.forEach(stat => {
      //  stat.created_at = moment.utc(stat.created_at).tz('America/Toronto').format("YYYY-MM-DD HH:mm:ss");
     // });

//registrationStats.forEach(stat => {
  //stat.created_at = moment(stat.created_at).tz('America/Toronto').format("YYYY-MM-DD HH:mm:ss");
//});
registrationStats.forEach(item => {
  item.created_at = moment.tz(item.created_at, 'UTC').tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss');
});

      const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
      res.status(200).json(helper.successResponse(dates, 200, 'Users registration stats.'));
    } catch(error) {
      return res.status(500).json(helper.errorResponse([], 500, error));
    }
  };*/
/*exports.registrationCompleted = async (req, res) => {
    let {
      gender = 'male',
      sort = 'email',
      order = 1,
      status = 2
    } = req.body;
  
    let start_date = req.body.start_date || moment().tz('America/Toronto').startOf('day').toDate();
    let end_date = req.body.end_date || moment().tz('America/Toronto').endOf('day').toDate();
  
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
  
    try{
      let registrationStats = await User.aggregate([
        {
          $match: {
            gender,
            status: +status,
            created_at: { $gte: startDate, $lte: endDate }
          },
        },
        {
          $group: {
            _id: {$dateToString:{format: "%Y-%m-%d", date: "$created_at"}},
            count: { $sum: 1 }
          }
        },
        {
          $sort : { _id : -1 }
        },
        {
          $project:  {
            _id: 0,
            created_at: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: { $toDate: "$_id" }
              }
            },
            count: 1,
          }
        },
      ]);
  
      
      registrationStats = registrationStats.map(item => {
        item.created_at = moment.utc(item.created_at, 'YYYY-MM-DD HH:mm:ss').tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss');
        return item;
      });
  
      const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
      res.status(200).json(helper.successResponse(dates, 200, 'Users registration stats.'));
    } catch(error) {
      return res.status(500).json(helper.errorResponse([], 500, error));
    }
  };*/
exports.registrationCompleted1 = async (req, res) => {
    let { gender = "male", sort = "email", order = 1, status = 2 } = req.body;

    let start_date = req.body.start_date || moment().tz("America/Toronto").startOf("day");
    let end_date = req.body.end_date || moment().tz("America/Toronto").endOf("day");

    // Get the current offset for 'America/Toronto' in minutes
    const currentOffset = moment.tz("America/Toronto").utcOffset();

    // Adjust the query dates by the current offset
    const startDate = new Date(start_date.subtract(currentOffset, "minutes").toDate());
    const endDate = new Date(end_date.subtract(currentOffset, "minutes").toDate());

    try {
        let registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: "$_id",
                    count: 1,
                },
            },
        ]);

        // Now shift the created_at date back by the offset to display it in 'America/Toronto' timezone
        registrationStats = registrationStats.map((item) => {
            item.created_at = moment
                .utc(item.created_at, "YYYY-MM-DD")
                .add(currentOffset, "minutes")
                .format("YYYY-MM-DD HH:mm:ss");
            return item;
        });

        const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

exports.registrationCompleted12 = async (req, res) => {
    let { gender = "male", sort = "email", order = 1, status = 2 } = req.body;

    let start_date = req.body.start_date || moment().tz("America/Toronto").format();
    let end_date = req.body.end_date || moment().tz("America/Toronto").format();

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: { $toDate: { $add: [new Date(0), "$_id"] } },
                            timezone: "America/Toronto",
                        },
                    },
                    count: 1,
                },
            },
        ]);

        const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompleted13 = async (req, res) => {
    let { gender = "male", sort = "email", order = 1, status = 2 } = req.body;

    let start_date = req.body.start_date || moment().startOf("day").toISOString();
    let end_date = req.body.end_date || moment().endOf("day").toISOString();

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: "$_id",
                    count: 1,
                },
            },
        ]);

        // Now convert the created_at date to 'America/Toronto' timezone
        registrationStats = registrationStats.map((item) => {
            item.created_at = moment
                .utc(item.created_at, "YYYY-MM-DD")
                .tz("America/Toronto")
                .format("YYYY-MM-DD HH:mm:ss");
            return item;
        });

        const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};
exports.registrationCompleted33 = async (req, res) => {
    let { gender = "male", sort = "email", order = 1, status = 2 } = req.body;

    let start_date =
        req.body.start_date || moment().tz("America/Toronto").startOf("day").toISOString();
    let end_date = req.body.end_date || moment().tz("America/Toronto").endOf("day").toISOString();

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {
        let registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: "$_id",
                    count: 1,
                },
            },
        ]);

        // Now convert the created_at date to 'America/Toronto' timezone
        registrationStats = registrationStats.map((item) => {
            item.created_at = moment
                .utc(item.created_at, "YYYY-MM-DD")
                .tz("America/Toronto")
                .format("YYYY-MM-DD HH:mm:ss");
            return item;
        });

        const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrtionCompleted44 = async (req, res) => {
    let { gender = "male", sort = "email", order = 1, status = 2 } = req.body;

    let start_date = req.body.start_date || moment().tz("America/Toronto").startOf("day").toDate();
    let end_date = req.body.end_date || moment().tz("America/Toronto").endOf("day").toDate();

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {
        let registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: "$_id",
                    count: 1,
                },
            },
        ]);

        // Now convert the created_at date to 'America/Toronto' timezone
        registrationStats = registrationStats.map((item) => {
            item.created_at = moment
                .tz(item.created_at, "YYYY-MM-DD", "America/Toronto")
                .format("YYYY-MM-DD HH:mm:ss");
            return item;
        });

        const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompleted55 = async (req, res) => {
    let { gender = "male", sort = "email", order = 1, status = 2 } = req.body;

    let start_date = req.body.start_date || moment().tz("America/Toronto").startOf("day").toDate();
    let end_date = req.body.end_date || moment().tz("America/Toronto").endOf("day").toDate();

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {
        let registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: "$_id",
                    count: 1,
                },
            },
        ]);

        // Now convert the created_at date to 'America/Toronto' timezone
        registrationStats = registrationStats.map((item) => {
            item.created_at = moment
                .tz(item.created_at, "YYYY-MM-DD", "America/Toronto")
                .format("YYYY-MM-DD HH:mm:ss");
            return item;
        });

        const dates = helper.loopThroughDateRange(startDate, endDate, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompletedtest = async (req, res) => {
    let {
        gender = "male",
        sort = "email",
        order = 1,
        status = 2,
        start_date = new Date(),
        end_date = new Date(),
    } = req.query;

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: new Date(start_date), $lte: new Date(end_date) },
                },
            },
            {
                $group: {
                    // _id: "$created_at",
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: { $toDate: "$_id" },
                    count: 1,
                },
            },
        ]);
        logger.debug(registrationStats);

        const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompletedd = async (req, res) => {
    let {
        gender = "male",
        sort = "email",
        order = 1,
        status = 2,
        start_date = new Date(),
        end_date = new Date(),
    } = req.query;

    // Convert start_date and end_date to 'EST'
    start_date = moment.tz(start_date, "America/New_York").startOf("day").toDate();
    end_date = moment.tz(end_date, "America/New_York").endOf("day").toDate();

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: start_date, $lte: end_date },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: { $toDate: "$_id" },
                    count: 1,
                },
            },
        ]);

        const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);
        logger.debug(dates);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompletedss = async (req, res) => {
    let {
        gender = "male",
        sort = "email",
        order = 1,
        status = 2,
        start_date = new Date(),
        end_date = new Date(),
    } = req.query;

    // Convert start_date and end_date to 'EST'
    start_date = moment.tz(start_date, "America/New_York").startOf("day").toDate();
    end_date = moment.tz(end_date, "America/New_York").endOf("day").toDate();

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: start_date, $lte: end_date },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: { $toDate: "$_id" },
                    count: 1,
                },
            },
        ]);
        logger.debug(registrationStats, "hhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
        const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);
        logger.debug(dates);
        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompletess = async (req, res) => {
    let {
        gender = "male",
        sort = "email",
        order = 1,
        status = 2,
        start_date = new Date(),
        end_date = new Date(),
    } = req.query;

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: new Date(start_date), $lte: new Date(end_date) },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$created_at",
                            timezone: "America/Toronto",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    created_at: { $toDate: "$_id" },
                    count: 1,
                },
            },
        ]);

        const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);
        const currentTime = moment().tz("America/Toronto");
        logger.debug(currentTime);

        res.status(200).json(
            helper.successResponse({ dates, currentTime }, 200, "Users registration stats.")
        );
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};
exports.registrationCompleted = async (req, res) => {
    let {
        gender = "male",
        sort = "email",
        order = 1,
        status = 2,
        start_date = new Date(),
        end_date = new Date(),
    } = req.query;

    // Convert start_date and end_date to 'EST'
    start_date = moment.tz(start_date, "America/New_York").startOf("day").toDate();
    end_date = moment.tz(end_date, "America/New_York").endOf("day").toDate();

    try {
        const registrationStats = await User.aggregate([
            {
                $match: {
                    gender,
                    status: +status,
                    created_at: { $gte: start_date, $lte: end_date },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 }, // Sort in ascending order based on the date
            },
        ]);

        logger.debug(registrationStats, "===");
        const dates = helper.loopThroughDateRange(start_date, end_date, registrationStats);

        res.status(200).json(helper.successResponse(dates, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/* Location data of user by gender, city & country
 * @param gender string ( male, female ),
 * @param locationType String (city & country),
 * @param status
 */

exports.geoStats = async (req, res) => {
    let { gender = "", locationType = "country", country = "", status = 2 } = req.query;

    let isCity = locationType == "country" ? "$country" : "$location";

    if (locationType == "city") {
        if (country == "") {
            return res
                .status(422)
                .json(
                    helper.errorResponse(
                        [{ country: "country needed for city  listing" }],
                        500,
                        "country needed for city  listing"
                    )
                );
        }
    }

    let matchQuery =
        locationType == "city"
            ? {
                  country,
                  status: +status,
              }
            : {
                  status: +status,
              };

    if (gender != "") {
        matchQuery.gender = gender;
    }
    logger.debug("here i sthe query", matchQuery);

    try {
        let registrationStats;

        registrationStats = await User.aggregate([
            {
                $match: matchQuery,
            },
            {
                $group: {
                    // _id: "$created_at",
                    _id: isCity,
                    totalCount: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    _id: 0,
                    location: "$_id",
                    totalCount: "$totalCount",
                },
            },
        ]);

        const totalData = await User.countDocuments(matchQuery);
        registrationStats = registrationStats.map((row) => {
            return {
                ...row,
                count: row.totalCount,
                totalCount: parseFloat(((row.totalCount * 100) / totalData).toFixed(2)),
            };
        });

        res.status(200).json(
            helper.successResponse(registrationStats, 200, "Users registration stats.")
        );
    } catch (error) {
        logger.debug(error);
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/**
 * Total users data by start date and end date
 * @param start_date date,
 * @param end_date should be greater than start_date,
 * @param status for user acyive status
 */
exports.totalUsersback = async (req, res) => {
    let { status = 2, start_date = new Date(), end_date = new Date() } = req.query;
    let { userdata } = req.datajwt;

    try {
        let Totalusers = await User.aggregate([
            {
                $match: {
                    status: +status,
                    created_at: { $gte: new Date(start_date), $lte: new Date(end_date) },
                },
            },
            {
                $group: {
                    _id: 0,
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    count: "$count",
                },
            },
        ]);

        let progress = await User.aggregate([
            {
                $match: {
                    status: +status,
                    created_at: {
                        $gte: new Date(userdata.last_logged_in),
                        $lte: new Date(end_date),
                    },
                },
            },
            {
                $group: {
                    _id: 0,
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    count: "$count",
                },
            },
        ]);
        logger.debug("here i am:", progress);
        let dataToBeUpdated = {};
        let percent = 0;
        if (progress.length > 0) {
            if ((status = 2)) {
                dataToBeUpdated = {
                    last_logged_in: new Date(),
                    active_user_count: progress[0].count,
                };
                percent = (progress[0].count / userdata.active_user_count) * 100;
                percent =
                    progress[0].count < userdata.active_user_count
                        ? "-" + percent + "%"
                        : "+" + percent + "%";
            } else if (status == 1) {
                dataToBeUpdated = { last_logged_in: new Date(), new_user_count: progress[0].count };
                percent = (progress[0].count / userdata.new_user_count) * 100;
                percent =
                    progress[0].count < userdata.new_user_count
                        ? "-" + percent + "%"
                        : "+" + percent + "%";
            } else if (status == 4) {
                dataToBeUpdated = {
                    last_logged_in: new Date(),
                    deactivated_user_count: progress[0].count,
                };
                percent = (progress[0].count / userdata.deactivated_user_count) * 100;
                percent =
                    progress[0].count < userdata.deactivated_user_count
                        ? "-" + percent + "%"
                        : "+" + percent + "%";
            }
        } else {
            if ((status = 2)) {
                dataToBeUpdated = { last_logged_in: new Date(), active_user_count: 0 };
            } else if (status == 1) {
                dataToBeUpdated = { last_logged_in: new Date(), new_user_count: 0 };
            } else if (status == 4) {
                dataToBeUpdated = { last_logged_in: new Date(), deactivated_user_count: 0 };
            }
            percent = "0%";
        }

        await User.findByIdAndUpdate({ _id: userdata._id }, dataToBeUpdated, {
            rawResult: true,
            function(data) {
                logger.debug("data updated");
            },
        });

        // logger.debug(userdata);
        if (Totalusers.length > 0) {
            Totalusers[0].percent = percent;
        } else {
            Totalusers = [
                {
                    count: 0,
                    percent: "0%",
                },
            ];
        }
        res.status(200).json(helper.successResponse(Totalusers, 200, "Users registration stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

exports.totalUsers = async (req, res) => {
    let {
        status = [0, 1, 2, 3],
        start_date = new Date("01/01/2000"),
        end_date = new Date(),
    } = req.query;

    if (start_date == null || start_date == "") {
        start_date = new Date("01/01/2000");
    }
    if (end_date == null || end_date == "") {
        end_date = new Date();
    }
    if (status.length == 0) {
        status = [0, 1, 2, 3];
    }
    if (!Array.isArray(status)) {
        status = status.toString();
        status = Array.from(status);
    }

    try {
        const { userdata } = req.datajwt;
        const { last_logged_in = new Date("01 January 0 00:00:00 UTC") } = userdata;

        start_date = start_date ? start_date : last_logged_in;
        const diffTime = Math.abs(new Date(end_date) - new Date(start_date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let prev_start_date = new Date(start_date);
        let prev_end_date = new Date(end_date);

        prev_start_date.setDate(new Date(start_date).getDate() - parseInt(diffDays));
        prev_end_date.setDate(new Date(end_date).getDate() - parseInt(diffDays));

        status = status.map((e) => parseInt(e));
        logger.debug("status here", status, start_date, end_date);
        let newUserQuery =
            status.indexOf(5) > -1
                ? { email_verified: true, documents_verified: false, status: { $eq: 1 } }
                : { status: { $in: status } };

        let latestTotalUsers = await User.aggregate([
            {
                $match: {
                    ...newUserQuery,
                    role: { $eq: 1 },
                    created_at: { $gte: new Date(start_date), $lte: new Date(end_date) },
                },
            },
            {
                $group: {
                    _id: 0,
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    count: "$count",
                },
            },
        ]);

        let prevTotalUsers = await User.aggregate([
            {
                $match: {
                    ...newUserQuery,
                    role: { $eq: 1 },
                    created_at: { $gte: new Date(prev_start_date), $lte: new Date(prev_end_date) },
                },
            },
            {
                $group: {
                    _id: 0,
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    count: "$count",
                },
            },
        ]);
        let prevCount = prevTotalUsers[0] ? prevTotalUsers[0].count : 1;
        let latestCount = latestTotalUsers[0] ? latestTotalUsers[0].count : 1;

        logger.debug("latestTotalUsers", latestTotalUsers);
        logger.debug("prevTotalUsers", prevTotalUsers);

        let percent = 0;
        // if(prevCount >0 && latestCount > 0){
        // percent = isFinite(latestCount / prevCount) ? (latestCount / prevCount) * 100 : 100;

        percent = isFinite(latestCount / prevCount)
            ? Math.abs((latestCount - prevCount) / prevCount) * 100
            : 100;

        // sign = latestCount.count <  prevCount ? "-" : "+"; // old
        sign = latestCount < prevCount ? "-" : "+";

        // }

        if (latestTotalUsers[0]) {
            latestTotalUsers[0].percent = percent;
            latestTotalUsers[0].sign = sign;
        } else {
            latestTotalUsers = [
                {
                    count: 0,
                    percent: 0,
                    sign: "+",
                },
            ];
        }

        res.status(200).json(
            helper.successResponse(latestTotalUsers, 200, "Users registration stats.")
        );
    } catch (error) {
        logger.debug(error);
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/**
 * New API to get total users with percentage
 */
exports.newTotalUsersWithPercentage = async (req, res) => {
    let user = req.datajwt.userdata;
    let {
        status = [1, 2, 3],
        start_date = new Date("01/01/2000"),
        end_date = new Date(),
    } = req.query;
    let newUserQuery =
        status.indexOf(5) > -1
            ? {
                  email_verified: true,
                  documents_verified: false,
                  status: { $eq: 1 },
                  role: { $eq: 1 },
              }
            : { status: { $in: status }, role: { $eq: 1 } };
    try {
        let latestTotalUsers = await User.find({
            ...newUserQuery,
            created_at: { $gte: new Date(start_date), $lte: new Date(end_date) },
        }).count();

        let prevTotalUsers = await User.find({
            ...newUserQuery,
            created_at: { $gte: new Date(start_date), $lte: new Date(user.before_last_logged_in) },
        }).count();

        let sign = latestTotalUsers < prevTotalUsers ? "-" : "+";
        let percent = (((latestTotalUsers - prevTotalUsers) * 100) / prevTotalUsers).toFixed(2);
        let data = {
            count: latestTotalUsers ? latestTotalUsers : 0,
            percent: percent ? percent : 0,
            sign: sign ? sign : "+",
        };
        res.status(200).json(helper.successResponse([data], 200, "Users registration stats."));
    } catch (error) {
        logger.debug(error);
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/**
 * Api to fetch verfied user, pending users and new users from db
 */
exports.usersCountWithPercentage = async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.datajwt.userdata._id });
        let activeUsers = await getCountAndPercentage(
            user.before_last_logged_in,
            (activeUsersStatus = 2),
            "active"
        );
        let newUsers = await getCountAndPercentage(
            user.before_last_logged_in,
            (newUsersStatus = 1),
            "new"
        );
        let pendingUsers = await getCountAndPercentage(
            user.before_last_logged_in,
            (pendingUsersStatus = 1),
            "pending"
        );
        let newData = { activeUsers, newUsers, pendingUsers };
        res.status(200).json(helper.successResponse(newData, 200, "Users registration stats."));
    } catch (error) {
        logger.debug(error);
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/**
 * Api to return verfied user, pending users and new users from db
 * @param usersBeforeLoginDate date,
 * @param type type of user like new, pending, active etc,
 * @param status for user type status
 */
const getCountAndPercentage = async (usersBeforeLoginDate, status, type) => {
    let start_date = new Date("01/01/2000");
    let end_date = new Date();
    start_date = moment.tz(start_date, "America/New_York").utc().toDate();
    end_date = moment.tz(end_date, "America/New_York").utc().toDate();
    if (status == 2) {
        // active users query
        query = { role: { $eq: 1 }, status: { $in: [2] }, email_verified: true };
    }
    if (status == 1) {
        // new users and pending users query
        if (type === "new") {
            query = { role: { $eq: 1 }, status: { $eq: 1 }, email_verified: true };
        } else {
            query = { role: { $eq: 1 }, status: { $eq: 1 }, email_verified: false };
        }
    }
    let latestTotalUsers = await User.find({
        ...query,
        created_at: { $gte: start_date, $lte: end_date },
    }).count();

    let prevTotalUsers = await User.find({
        ...query,
        created_at: { $gte: start_date, $lte: new Date(usersBeforeLoginDate) },
    }).count();

    let percent = 0;
    if (prevTotalUsers == 0 && latestTotalUsers == 0) {
        percent = 0;
    } else if (prevTotalUsers > latestTotalUsers) {
        percent = 0;
    } else if (prevTotalUsers == 0 && latestTotalUsers > 0) {
        percent = latestTotalUsers * 100;
    } else {
        percent = parseFloat(
            (((latestTotalUsers - prevTotalUsers) * 100) / prevTotalUsers).toFixed(2)
        );
    }

    let data = {
        count: latestTotalUsers ? latestTotalUsers : 0,
        beforeLoginCount: prevTotalUsers ? prevTotalUsers : 0,
        percent: percent ? percent : 0,
    };
    return data;
};

/**
 * Api to fetch verfied user, pending users and new users from db by datetime
 */
exports.usersCountByDate = async (req, res) => {
    try {
        // let user = await User.findOne({_id: req.datajwt.userdata._id});
        let startDate = req.query.start_date ? req.query.start_date : new Date("01/01/2000");
        let endDate = req.query.end_date ? req.query.end_date : new Date();
        startDate = moment.tz(startDate, "America/New_York").utc().toDate();
        endDate = moment.tz(endDate, "America/New_York").utc().toDate();

        let userType = req.query.user_type ? req.query.user_type : "active"; // active, new, pending
        let status = req.query.status;

        if (status == 2) {
            // active users query
            userType = "active";
            query = { role: { $eq: 1 }, status: { $in: [2] }, email_verified: true };
        }
        if (status == 1) {
            // new users and pending users query
            if (userType === "new") {
                query = { role: { $eq: 1 }, status: { $eq: 1 }, email_verified: true };
            } else {
                userType = "pending";
                query = { role: { $eq: 1 }, status: { $eq: 1 }, email_verified: false };
            }
        }
        let usersCount = (
            await User.find({
                ...query,
                created_at: { $gte: startDate, $lte: endDate },
            })
        ).length;

        let data = {
            startDate,
            endDate,
            userType,
            count: usersCount ? usersCount : 0,
        };
        res.status(200).json(helper.successResponse(data, 200, "Users counts data."));
    } catch (error) {
        logger.debug(error);
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

// Subscription Analytics endpoint
exports.subscriptionAnalytics = async (req, res) => {
  try {
    const Payment = require("../../models/payment");
    const User = require("../../models/user");

    const daysFilter = parseInt(req.query.days, 10) || 0;
    const paymentStatusFilter = String(req.query.payment_status || "all").toLowerCase();

    const startDate = req.query.start_date
      ? moment(req.query.start_date).tz("America/Toronto").startOf("day").toDate()
      : daysFilter > 0
      ? moment().tz("America/Toronto").subtract(daysFilter, "days").startOf("day").toDate()
      : new Date("2000-01-01T00:00:00.000Z");
    const endDate = req.query.end_date
      ? moment(req.query.end_date).tz("America/Toronto").endOf("day").toDate()
      : moment().tz("America/Toronto").endOf("day").toDate();

    const normalizeStatus = (status) => String(status || "unknown").toLowerCase();
    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const toInt = (value) => {
      const parsed = parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const roundCurrency = (value) => Number((value || 0).toFixed(2));
    const isSuccessStatus = (status) => ["completed", "complete", "paid"].includes(status);
    const isFailedStatus = (status) => ["failed", "cancelled", "canceled", "declined", "expired"].includes(status);
    const getDateKey = (date) => moment(date).tz("America/Toronto").format("YYYY-MM-DD");
    const upsertSeriesRow = (map, dateKey) => {
      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          revenue: 0,
          count: 0,
          completedRevenue: 0,
          completedCount: 0,
          interested: 0,
          superInterested: 0,
          chat: 0,
          aLaCarteChats: 0,
          queensBundleChats: 0,
        };
      }

      return map[dateKey];
    };
    const deriveChatBreakdown = (payment) => {
      const metadata = payment.metadata || {};
      const chatTokens = toInt(payment.chat_tokens);
      let aLaCarteCount = toInt(payment.a_la_carte_count || metadata.aLaCarteCount);
      let queensBundleCount = toInt(payment.queens_bundle_count || metadata.queensBundleCount);

      if ((aLaCarteCount <= 0 && queensBundleCount <= 0) && chatTokens > 0) {
        const amount = toNumber(payment.amount);
        const inferredQueensBundle = Math.round((chatTokens - amount * 2) / 50);
        const inferredALaCarte = chatTokens - inferredQueensBundle * 100;
        const reconstructedAmount = inferredALaCarte * 0.5 + inferredQueensBundle * 25;

        if (
          inferredQueensBundle >= 0 &&
          inferredALaCarte >= 0 &&
          Math.abs(reconstructedAmount - amount) < 0.01
        ) {
          aLaCarteCount = inferredALaCarte;
          queensBundleCount = inferredQueensBundle;
        } else {
          aLaCarteCount = chatTokens;
          queensBundleCount = 0;
        }
      }

      return {
        aLaCarteCount,
        queensBundleCount,
        aLaCarteChats: aLaCarteCount,
        queensBundleChats: queensBundleCount * 100,
      };
    };

    const paymentQuery = {
      created_at: { $gte: startDate, $lte: endDate },
    };

    if (paymentStatusFilter !== "all") {
      paymentQuery.payment_status = paymentStatusFilter;
    }

    logger.info("Subscription Analytics Query:", {
      paymentQuery,
      daysFilter,
      paymentStatusFilter,
      startDate,
      endDate,
    });

    const payments = await Payment.find(paymentQuery).sort({ created_at: -1 }).lean();
    const totalPaymentsInDB = await Payment.countDocuments({});

    const userIds = Array.from(
      new Set(
        payments
          .map((payment) => (payment.username_id ? String(payment.username_id) : ""))
          .filter(Boolean)
      )
    );
    const users = await User.find({ _id: { $in: userIds } }).select("user_name first_name last_name").lean();
    const userMap = users.reduce((acc, user) => {
      acc[String(user._id)] = user;
      return acc;
    }, {});

    const totals = {
      interested: 0,
      superInterested: 0,
      chat: 0,
      revenue: 0,
      transactions: payments.length,
      completedRevenue: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      uniqueBuyers: userIds.length,
      aLaCarteChats: 0,
      queensBundleChats: 0,
      aLaCarteRevenue: 0,
      queensBundleRevenue: 0,
      aLaCarteOrders: 0,
      queensBundleOrders: 0,
      queensBundlePurchases: 0,
      interestedRevenue: 0,
      superInterestedRevenue: 0,
    };

    const statusMap = {};
    const seriesMap = {};
    const buyerMap = {};

    payments.forEach((payment) => {
      const interestedTokens = toInt(payment.interested_tokens);
      const superInterestedTokens = toInt(payment.super_interested_tokens);
      const chatTokens = toInt(payment.chat_tokens);
      const amount = toNumber(payment.amount);
      const status = normalizeStatus(payment.payment_status);
      const buyerId = payment.username_id ? String(payment.username_id) : "unknown";
      const dateKey = getDateKey(payment.created_at);
      const chatBreakdown = deriveChatBreakdown(payment);

      totals.interested += interestedTokens;
      totals.superInterested += superInterestedTokens;
      totals.chat += chatTokens;
      totals.revenue += amount;
      totals.interestedRevenue += interestedTokens * 2;
      totals.superInterestedRevenue += superInterestedTokens * 4;
      totals.aLaCarteChats += chatBreakdown.aLaCarteChats;
      totals.queensBundleChats += chatBreakdown.queensBundleChats;
      totals.aLaCarteRevenue += chatBreakdown.aLaCarteCount * 0.5;
      totals.queensBundleRevenue += chatBreakdown.queensBundleCount * 25;
      totals.queensBundlePurchases += chatBreakdown.queensBundleCount;

      if (chatBreakdown.aLaCarteChats > 0) {
        totals.aLaCarteOrders += 1;
      }

      if (chatBreakdown.queensBundleCount > 0) {
        totals.queensBundleOrders += 1;
      }

      if (isSuccessStatus(status)) {
        totals.completedTransactions += 1;
        totals.completedRevenue += amount;
      } else if (isFailedStatus(status)) {
        totals.failedTransactions += 1;
      } else {
        totals.pendingTransactions += 1;
      }

      if (!statusMap[status]) {
        statusMap[status] = {
          status,
          count: 0,
          revenue: 0,
          interestedTokens: 0,
          superInterestedTokens: 0,
          chatTokens: 0,
        };
      }

      statusMap[status].count += 1;
      statusMap[status].revenue += amount;
      statusMap[status].interestedTokens += interestedTokens;
      statusMap[status].superInterestedTokens += superInterestedTokens;
      statusMap[status].chatTokens += chatTokens;

      const seriesRow = upsertSeriesRow(seriesMap, dateKey);
      seriesRow.revenue += amount;
      seriesRow.count += 1;
      seriesRow.interested += interestedTokens;
      seriesRow.superInterested += superInterestedTokens;
      seriesRow.chat += chatTokens;
      seriesRow.aLaCarteChats += chatBreakdown.aLaCarteChats;
      seriesRow.queensBundleChats += chatBreakdown.queensBundleChats;

      if (isSuccessStatus(status)) {
        seriesRow.completedRevenue += amount;
        seriesRow.completedCount += 1;
      }

      if (!buyerMap[buyerId]) {
        buyerMap[buyerId] = {
          buyerId,
          totalSpent: 0,
          transactionCount: 0,
          interestedTokens: 0,
          superInterestedTokens: 0,
          chatTokens: 0,
          aLaCarteChats: 0,
          queensBundleChats: 0,
          queensBundleCount: 0,
          completedTransactions: 0,
          lastPaymentAt: payment.created_at,
        };
      }

      buyerMap[buyerId].totalSpent += amount;
      buyerMap[buyerId].transactionCount += 1;
      buyerMap[buyerId].interestedTokens += interestedTokens;
      buyerMap[buyerId].superInterestedTokens += superInterestedTokens;
      buyerMap[buyerId].chatTokens += chatTokens;
      buyerMap[buyerId].aLaCarteChats += chatBreakdown.aLaCarteChats;
      buyerMap[buyerId].queensBundleChats += chatBreakdown.queensBundleChats;
      buyerMap[buyerId].queensBundleCount += chatBreakdown.queensBundleCount;
      if (isSuccessStatus(status)) {
        buyerMap[buyerId].completedTransactions += 1;
      }
      if (new Date(payment.created_at) > new Date(buyerMap[buyerId].lastPaymentAt)) {
        buyerMap[buyerId].lastPaymentAt = payment.created_at;
      }
    });

    const revenueOverTime = Object.values(seriesMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        ...row,
        revenue: roundCurrency(row.revenue),
        completedRevenue: roundCurrency(row.completedRevenue),
      }));

    const subscriptionTrends = revenueOverTime.map((row) => ({
      date: row.date,
      interested: row.interested,
      superInterested: row.superInterested,
      chat: row.chat,
      aLaCarteChats: row.aLaCarteChats,
      queensBundleChats: row.queensBundleChats,
    }));

    const topBuyers = Object.values(buyerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map((buyer) => {
        const user = userMap[buyer.buyerId];
        const username = user?.user_name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Unknown";
        return {
          username,
          totalSpent: roundCurrency(buyer.totalSpent),
          transactionCount: buyer.transactionCount,
          interestedTokens: buyer.interestedTokens,
          superInterestedTokens: buyer.superInterestedTokens,
          chatTokens: buyer.chatTokens,
          aLaCarteChats: buyer.aLaCarteChats,
          queensBundleChats: buyer.queensBundleChats,
          queensBundleCount: buyer.queensBundleCount,
          completedTransactions: buyer.completedTransactions,
          lastPaymentAt: buyer.lastPaymentAt,
        };
      });

    const recentTransactions = payments.slice(0, 12).map((payment) => {
      const user = userMap[String(payment.username_id)] || {};
      const username = user.user_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unknown";
      const chatBreakdown = deriveChatBreakdown(payment);
      return {
        id: payment.transaction_id || String(payment._id),
        username,
        amount: roundCurrency(toNumber(payment.amount)),
        paymentStatus: normalizeStatus(payment.payment_status),
        createdAt: payment.created_at,
        interestedTokens: toInt(payment.interested_tokens),
        superInterestedTokens: toInt(payment.super_interested_tokens),
        chatTokens: toInt(payment.chat_tokens),
        aLaCarteChats: chatBreakdown.aLaCarteChats,
        queensBundleChats: chatBreakdown.queensBundleChats,
        queensBundleCount: chatBreakdown.queensBundleCount,
        provider: payment.bank_name || "",
      };
    });

    const paymentStatusBreakdown = Object.values(statusMap)
      .sort((a, b) => b.count - a.count)
      .map((row) => ({
        ...row,
        revenue: roundCurrency(row.revenue),
      }));

    const responseData = {
      totalInterestedTokens: totals.interested,
      totalSuperInterestedTokens: totals.superInterested,
      totalChatTokens: totals.chat,
      totalRevenue: roundCurrency(totals.revenue),
      totalTransactions: totals.transactions,
      completedRevenue: roundCurrency(totals.completedRevenue),
      completedTransactions: totals.completedTransactions,
      pendingTransactions: totals.pendingTransactions,
      failedTransactions: totals.failedTransactions,
      uniqueBuyers: totals.uniqueBuyers,
      averageTransactionValue:
        totals.transactions > 0 ? roundCurrency(totals.revenue / totals.transactions) : 0,
      tokenDistribution: {
        interested: totals.interested,
        superInterested: totals.superInterested,
        chat: totals.chat,
      },
      productBreakdown: [
        {
          key: "interested",
          label: "Interested",
          units: totals.interested,
          orders: payments.filter((payment) => toInt(payment.interested_tokens) > 0).length,
          revenue: roundCurrency(totals.interestedRevenue),
        },
        {
          key: "superInterested",
          label: "Super Interested",
          units: totals.superInterested,
          orders: payments.filter((payment) => toInt(payment.super_interested_tokens) > 0).length,
          revenue: roundCurrency(totals.superInterestedRevenue),
        },
        {
          key: "aLaCarte",
          label: "Girls Chat A La Carte",
          units: totals.aLaCarteChats,
          orders: totals.aLaCarteOrders,
          revenue: roundCurrency(totals.aLaCarteRevenue),
        },
        {
          key: "queensBundle",
          label: "Girls Chat Queens Bundle",
          units: totals.queensBundleChats,
          orders: totals.queensBundleOrders,
          revenue: roundCurrency(totals.queensBundleRevenue),
        },
      ],
      chatBreakdown: {
        totalChats: totals.chat,
        aLaCarteChats: totals.aLaCarteChats,
        queensBundleChats: totals.queensBundleChats,
        aLaCarteOrders: totals.aLaCarteOrders,
        queensBundleOrders: totals.queensBundleOrders,
        queensBundlePurchases: totals.queensBundlePurchases,
        aLaCarteRevenue: roundCurrency(totals.aLaCarteRevenue),
        queensBundleRevenue: roundCurrency(totals.queensBundleRevenue),
      },
      paymentStatusBreakdown,
      revenueOverTime,
      subscriptionTrends,
      topBuyers,
      recentTransactions,
    };

    res.status(200).json({
      status: 200,
      data: responseData,
    });
  } catch (error) {
    logger.error("Error in subscriptionAnalytics:", error);
    res.status(500).json({
      status: 500,
      message: "Error fetching subscription analytics",
      error: error.message,
    });
  }
};

exports.getPricingConfig = async (req, res) => {
  try {
    const config =
      (await PricingConfig.findOne({ key: "default" }).lean()) ||
      getDefaultPricingConfig();

    return res
      .status(200)
      .json(
        helper.successResponse(
          mergePricingConfig(config),
          200,
          "Pricing config fetched."
        )
      );
  } catch (error) {
    logger.error("Error in getPricingConfig:", error);
    return res
      .status(500)
      .json(helper.errorResponse([], 500, "Error fetching pricing config"));
  }
};

exports.updatePricingConfig = async (req, res) => {
  try {
    const existingConfig = mergePricingConfig(
      (await PricingConfig.findOne({ key: "default" }).lean()) ||
        getDefaultPricingConfig()
    );
    const normalizedPayload = normalizePricingConfigPayload(
      req.body,
      existingConfig,
      req?.user?.email || ""
    );

    const config = await PricingConfig.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          key: "default",
          ...normalizedPayload,
          updatedBy: String(req?.user?.email || normalizedPayload.updatedBy || ""),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res
      .status(200)
      .json(
        helper.successResponse(
          mergePricingConfig(config),
          200,
          "Pricing config updated."
        )
      );
  } catch (error) {
    logger.error("Error in updatePricingConfig:", error);
    return res
      .status(500)
      .json(helper.errorResponse([], 500, "Error updating pricing config"));
  }
};

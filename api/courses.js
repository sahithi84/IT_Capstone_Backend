'use strict';
 
const uuid = require('uuid');
const AWS = require('aws-sdk'); 
 
AWS.config.setPromisesDependency(require('bluebird'));
 
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submitCourseResources = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const courseNumber = requestBody.courseNumber;
  const syllabus = requestBody.syllabus;
  const learningOutcomes = requestBody.learningOutcomes;
  const offeringHistory = requestBody.offeringHistory;
  const owlExpressLink = requestBody.owlExpressLink;
  const courseCatalog = requestBody.courseCatalog;

  if (typeof syllabus !== 'string' || typeof owlExpressLink !== 'string' || typeof courseNumber !== 'number'
    ||  typeof courseCatalog !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit resources because of validation errors.'));
    return;
  }
  submitResources(resourcesInfo(courseNumber, syllabus, learningOutcomes, offeringHistory, owlExpressLink, courseCatalog))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted resource for ${courseNumber}`,
          courseId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit resource for ${courseNumber}`
        })
      })
    });
};

const submitResources = resource => {
  console.log('Submitting resource');
  const reourceInfo = {
    TableName: process.env.COURSE_RESOURCES_TABLE,
    Item: resource,
  };
  return dynamoDb.put(reourceInfo).promise()
    .then(res => resource);
};
 
const resourcesInfo = (courseNumber, syllabus, learningOutcomes, offeringHistory, owlExpressLink, courseCatalog) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    courseNumber: courseNumber,
    syllabus: syllabus,
    learningOutcomes: learningOutcomes,
    offeringHistory: offeringHistory,
    owlExpressLink: owlExpressLink,
    courseCatalog: courseCatalog,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

module.exports.fetchResources = (event, context, callback) => {
  var params = {
    TableName: process.env.COURSE_RESOURCES_TABLE,
    ProjectionExpression: "id, courseNumber, syllabus, learningOutcomes, offeringHistory, owlExpressLink, courseCatalog"
  };

  console.log("Scanning Courses table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({
                  courses: data.Items
              })
          });
      }

  };
  dynamoDb.scan(params, onScan);
};

module.exports.fetchSingleResource = (event, context, callback) => {
  // console.log("Scanning Resources table with id : "+event.queryStringParameters.id.toString());
  const params = {
    TableName: process.env.COURSE_RESOURCES_TABLE,
    Key: {
      id: event.queryStringParameters.id
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch course resource.'));
      return;
    });
};

module.exports.submitPermSchedule = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const courseNumber = requestBody.courseNumber;
  const coursePrefix = requestBody.coursePrefix;
  const fallEven = requestBody.fallEven;
  const springOdd = requestBody.springOdd;
  const summerOdd = requestBody.summerOdd;
  const fallOdd = requestBody.fallOdd;
  const springEven = requestBody.springEven;
  const summerEven = requestBody.summerEven;

  if (typeof coursePrefix !== 'string' || typeof fallEven !== 'string' || typeof courseNumber !== 'number'
    ||  typeof springOdd !== 'string' ||  typeof summerOdd !== 'string' ||  typeof fallOdd !== 'string' ||  typeof springEven !== 'string'
    ||  typeof summerEven !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit perm schedule because of validation errors.'));
    return;
  }
  submitSchedules(scheduleInfo(courseNumber, coursePrefix, fallEven, springOdd, summerOdd, fallOdd, springEven, summerEven))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted resource for ${courseNumber}`,
          courseId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit resource for ${courseNumber}`
        })
      })
    });
};

const submitSchedules = schedule => {
  console.log('Submitting perm schedule');
  const scheduleInfo = {
    TableName: process.env.COURSE_PERM_SCHEDULE_TABLE,
    Item: schedule,
  };
  return dynamoDb.put(scheduleInfo).promise()
    .then(res => schedule);
};
 
const scheduleInfo = (courseNumber, coursePrefix, fallEven, springOdd, summerOdd, fallOdd, springEven, summerEven) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    courseNumber: courseNumber,
    coursePrefix: coursePrefix,
    fallEven: fallEven,
    springOdd: springOdd,
    summerOdd: summerOdd,
    fallOdd: fallOdd,
    springEven: springEven,
    summerEven: summerEven,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

module.exports.fetchPermSchedules = (event, context, callback) => {
  var params = {
    TableName: process.env.COURSE_PERM_SCHEDULE_TABLE,
    ProjectionExpression: "id, courseNumber, coursePrefix, fallEven, springOdd, summerOdd, fallOdd, springEven, summerEven"
  };

  console.log("Scanning Perm Schedule table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({
                  courses: data.Items
              })
          });
      }

  };
  dynamoDb.scan(params, onScan);
};

module.exports.fetchSinglePermSchedule = (event, context, callback) => {
  // console.log("Scanning Resources table with id : "+event.queryStringParameters.id.toString());
  const params = {
    TableName: process.env.COURSE_PERM_SCHEDULE_TABLE,
    Key: {
      id: event.queryStringParameters.id
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch perm schedule.'));
      return;
    });
};


module.exports.submitCourseALG = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const courseNumber = requestBody.courseNumber;
  const algEligible = requestBody.algEligible;
  const historyRoundAndDevelopers = requestBody.historyRoundAndDevelopers;
  const algDeveloper = requestBody.algDeveloper;
  const latestALGRound = requestBody.latestALGRound;
  const latestDeveloper = requestBody.latestDeveloper;
  const note = requestBody.note;

  if (typeof algEligible !== 'string' || typeof historyRoundAndDevelopers !== 'string' || typeof courseNumber !== 'number'
    ||  typeof algDeveloper !== 'string' || typeof latestALGRound !== 'string' || typeof latestDeveloper !== 'string' || typeof note !== 'string' ) {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit resources because of validation errors.'));
    return;
  }
  submitALG(algInfo(courseNumber, algEligible, historyRoundAndDevelopers, algDeveloper, latestALGRound, latestDeveloper, note))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted resource for ${courseNumber}`,
          courseId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit resource for ${courseNumber}`
        })
      })
    });
};

const submitALG = alg => {
  console.log('Submitting alg');
  const algInfo = {
    TableName: process.env.COURSE_ALG_TABLE,
    Item: alg,
  };
  return dynamoDb.put(algInfo).promise()
    .then(res => alg);
};
 
const algInfo = (courseNumber, algEligible, historyRoundAndDevelopers, algDeveloper, latestALGRound, latestDeveloper, note) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    courseNumber: courseNumber,
    algEligible: algEligible,
    historyRoundAndDevelopers: historyRoundAndDevelopers,
    algDeveloper: algDeveloper,
    latestALGRound: latestALGRound,
    latestDeveloper: latestDeveloper,
    note: note,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

module.exports.fetchALG = (event, context, callback) => {
  var params = {
    TableName: process.env.COURSE_ALG_TABLE,
    ProjectionExpression: "id, courseNumber, algEligible, historyRoundAndDevelopers, algDeveloper, latestALGRound, latestDeveloper, note"
  };

  console.log("Scanning ALG table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({
                  courses: data.Items
              })
          });
      }

  };

  dynamoDb.scan(params, onScan);
};

module.exports.fetchSingleALG = (event, context, callback) => {
  // console.log("Scanning Resources table with id : "+event.queryStringParameters.id.toString());
  const params = {
    TableName: process.env.COURSE_ALG_TABLE,
    Key: {
      id: event.queryStringParameters.id
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch course ALG.'));
      return;
    });
};

module.exports.submitCoordinator = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const courseNumber = requestBody.courseNumber;
  const firstName = requestBody.firstName;
  const lastName = requestBody.lastName;
  const email = requestBody.email;
  const d2lMasterLink = requestBody.d2lMasterLink;

  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof courseNumber !== 'number'
    ||  typeof email !== 'string' || typeof d2lMasterLink !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit coordinator because of validation errors.'));
    return;
  }
  submitCoordinator(coordinatorInfo(courseNumber, firstName, lastName, email, d2lMasterLink))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted coordinator for ${courseNumber}`,
          courseId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit coordinator for ${courseNumber}`
        })
      })
    });
};

const submitCoordinator = coordinator => {
  console.log('Submitting coordinator');
  const coordinatorInfo = {
    TableName: process.env.COURSE_COORDINATOR_TABLE,
    Item: coordinator,
  };
  return dynamoDb.put(coordinatorInfo).promise()
    .then(res => coordinator);
};
 
const coordinatorInfo = (courseNumber, firstName, lastName, email, d2lMasterLink) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    courseNumber: courseNumber,
    firstName: firstName,
    lastName: lastName,
    email: email,
    d2lMasterLink: d2lMasterLink,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

module.exports.fetchCoordinators = (event, context, callback) => {
  var params = {
    TableName: process.env.COURSE_COORDINATOR_TABLE,
    ProjectionExpression: "id, courseNumber, firstName, lastName, email, d2lMasterLink"
  };

  console.log("Scanning Courses table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({
                  courses: data.Items
              })
          });
      }

  };

  dynamoDb.scan(params, onScan);
};

module.exports.fetchSingleCoordinator = (event, context, callback) => {
  // console.log("Scanning Resources table with id : "+event.queryStringParameters.id.toString());
  const params = {
    TableName: process.env.COURSE_COORDINATOR_TABLE,
    Key: {
      id: event.queryStringParameters.id
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch course resource.'));
      return;
    });
};

module.exports.submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const prefix = requestBody.prefix;
  const courseNumber = requestBody.courseNumber;
  const courseName = requestBody.courseName;
  const creditHours = requestBody.creditHours;
  const prerequisite = requestBody.prerequisite;
  const description = requestBody.description;
  const courseSchedule = requestBody.courseSchedule;
  const memo = requestBody.memo;
 
  if (typeof prefix !== 'string' || typeof courseName !== 'string' || typeof courseNumber !== 'number'
    || typeof creditHours !== 'number' || typeof prerequisite !== 'string' || typeof description !== 'string'
    || typeof courseSchedule !== 'string' || typeof memo !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit course because of validation errors.'));
    return;
  }
 
  submitCourseP(courseInfo(prefix, courseName, courseNumber, creditHours, prerequisite, description, courseSchedule, memo))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted course with course name ${courseName}`,
          courseId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit course with name ${courseName}`
        })
      })
    });
};
 
 
const submitCourseP = course => {
  console.log('Submitting course');
  const courseInfo = {
    TableName: process.env.BSIT_COURSES_TABLE,
    Item: course,
  };
  return dynamoDb.put(courseInfo).promise()
    .then(res => course);
};
 
const courseInfo = (prefix, courseName, courseNumber, creditHours, prerequisite, description, courseSchedule, memo) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    prefix: prefix,
    courseName: courseName,
    courseNumber: courseNumber,
    creditHours: creditHours,
    prerequisite: prerequisite,
    description: description,
    courseSchedule: courseSchedule,
    memo: memo,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};
module.exports.fetch = (event, context, callback) => {
  var params = {
    TableName: process.env.BSIT_COURSES_TABLE,
    ProjectionExpression: "id, prefix, courseName, courseNumber, creditHours, prerequisite, description, courseSchedule, memo"
  };

  console.log("Scanning Courses table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({
                  courses: data.Items
              })
          });
      }

  };

  dynamoDb.scan(params, onScan);
}; 

module.exports.fetchSingleCourse = (event, context, callback) => {
  // console.log("Scanning Resources table with id : "+event.queryStringParameters.id.toString());
  const params = {
    TableName: process.env.BSIT_COURSES_TABLE,
    Key: {
      id: event.queryStringParameters.id
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch course resource.'));
      return;
    });
};

module.exports.getExploreData = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const long = requestBody.long;
  const lat = requestBody.lat;
  const city = requestBody.city;
  const state = requestBody.state;
  const country = requestBody.country;

  if (typeof long !== 'number' || typeof lat !== 'number' || typeof city !== 'string'
    ||  typeof state !== 'string' ||  typeof country !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t fetch the response because of validation errors.'));
    return;
  }
  const params = {
    TableName: process.env.EXPLORE_DATA_TABLE,
    Key: {
      id: city+""+state+""+country
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch explore data.'));
      return;
    });
};

module.exports.submitExploreData = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const long = requestBody.long;
  const lat = requestBody.lat;
  const city = requestBody.city;
  const state = requestBody.state;
  const country = requestBody.country;
  const about = requestBody.about;
  const species = requestBody.species;
  const habitats = requestBody.habitats;

  if (typeof long !== 'number' || typeof lat !== 'number' || typeof city !== 'string'
    ||  typeof state !== 'string' ||  typeof country !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t fetch the response because of validation errors.'));
    return;
  }
  submitData(dataInfo(long, lat, city, state, country, about, species, habitats))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted explore data for ${city} ${state} ${country}`,
          id: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit explore data for ${city} ${state} ${country}`
        })
      })
    });
};

const submitData = resource => {
  console.log('Submitting explore data');
  const reourceInfo = {
    TableName: process.env.EXPLORE_DATA_TABLE,
    Item: resource,
  };
  return dynamoDb.put(reourceInfo).promise()
    .then(res => resource);
};
 
const dataInfo = (long, lat, city, state, country, about, species, habitats) => {
  const timestamp = new Date().getTime();
  return {
    id: city+""+state+""+country,
    long: long,
    lat: lat,
    city: city,
    state: state,
    coumtry: country,
    about: about,
    species: species,
    habitats: habitats,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};
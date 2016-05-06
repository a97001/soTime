// 'use strict';
//
// /**
//  * Module dependencies.
//  */
//
// var mongoose = require('mongoose'),
//     mongoosastic = require('mongoosastic'),
//     async = require("async"),
//     Grid = require('gridfs-stream'),
//     config = require('meanio').loadConfig(),
//     Transaction = require('mongoose-transact'),
//     _ = require('lodash');
//
// var Building = mongoose.model('Building'),
//     Floor = mongoose.model('Floor'),
//     FsFile = mongoose.model('FsFile'),
//     Equipment = mongoose.model('Equipment'),
//     User = mongoose.model('User'),
//     Document = mongoose.model('Document'),
//     Trash = mongoose.model('Trash');
//
// var ObjectId = mongoose.Types.ObjectId;
// Grid.mongo = mongoose.mongo;
// var gfs = Grid(mongoose.connection.db, mongoose.mongo);
//
// var elasticsearch = require('elasticsearch');
// var client = new elasticsearch.Client({
//   host: config.elasticsearch.host
// });
//
// // var auth = require('../authorizations/documents');
//
// module.exports = function(FloorPlan) {
//     return {
//         /**
//          * Find document by id
//          */
//         document: function(req, res, next, id) {
//             if (!req.user) return res.status(401).end();
//             Document.findOne({'_id': id, 'company': {$in: req.user.company}, 'status': {$ne: 'deleted'}}).exec(function(err, document) {
//                 if (err) {
//                     console.log(err);
//                     return res.status(500).end();
//                 }
//                 if (!document) {
//                     return res.status(404).end();
//                 }
//                 req.document = document;
//                 next();
//             });
//         },
//
//         /**
//          * Find old version by id
//          */
//         oldVersion: function(req, res, next, id) {
//             if (!req.user) return res.status(401).end();
//             var user = new User(req.user);
//             var query = [{ $match: {'docs._id': ObjectId(id), 'company': {$in: user.company}, 'status': {$ne: 'deleted'}}},
//                 { $project: {'docs': 1}},
//                 { $unwind: "$docs"},
//                 { $match: {'docs._id': ObjectId(id)}}];
//
//             Document.aggregate(query, function (err, result) {
//                 if (err) {
//                     console.log(err);
//                     res.status(500).end();
//                 }
//                 if (!result || !result[0]) {
//                     Document.findOne({'current._id': req.document.current._id, company: {$in: user.company}, 'status': {$ne: 'deleted'}}, 'current', function(err, oldVersion) {
//                         if (err) {
//                             console.log(err);
//                             res.status(500).end();
//                         }
//                         if (!oldVersion) return res.status(404).end();
//                         req.oldVersion = oldVersion.current;
//                         next();
//                     });
//                 } else {
//                     req.oldVersion = result[0].docs;
//                     next();
//                 }
//             });
//         },
//
//         /**
//          * Download document
//          */
//         showDocument: function(req, res) {
//             res.writeHead(200, {
//                 'Content-Length' : req.document.current.length
//             });
//             gfs.createReadStream({
//                 _id: req.document.current._id
//             }).pipe(res);
//         },
//
//         /**
//          * Show cTags of documents
//          */
//          showCTags: function(req, res) {
//             if (!req.query.buildingId) {
//               return res.status(400).json({error: 'Missing building ID in query string'});
//             }
//             // Get cTags by featureType
//             if (req.query.featureType) {
//                 Floor.aggregate([
//                     { $match: {building: req.building._id}},
//                     { $unwind: "$features"},
//                     { $unwind: "$features.doc"},
//                     { $group: {
//                         _id: '$features.type',
//                         "doc" : { "$addToSet" : "$features.doc"}
//                     }},
//                     { $match: {'_id': req.query.featureType}}
//                 ], function (err, result) {
//                     if (err) {
//                         console.log(err);
//                         res.status(500).end();
//                     }
//                     if (!result || result.length === 0)
//                         return res.json([]);
//                     Document.aggregate([
//                         { $match: {_id: {$in: result[0].doc}, 'status': {$ne: 'deleted'}}},
//                         { $unwind: "$metadata.tags.cTags"},
//                         { $sort: {"metadata.tags.cTags": 1}},
//                         { $group: {
//                             _id: null,
//                             cTags: {$addToSet: '$metadata.tags.cTags'}
//                         }}
//                     ], function (err, result) {
//                         if (err) {
//                             console.log(err);
//                             res.status(500).end();
//                         }
//                         if (!result[0] || !result[0].cTags) return res.json([]);
//                         res.json(result[0].cTags);
//                     });
//                 });
//             // Get cTags by system and subSystem
//             } else if (req.query.system && req.query.subSystem) {
//               Document.aggregate([
//                   { $match: {'metadata.building': req.building._id, 'metadata.tags.system': req.query.system, 'metadata.tags.subSystem': req.query.subSystem, 'status': {$ne: 'deleted'}}},
//                   { $unwind: "$metadata.tags.cTags"},
//                   { $sort: {"metadata.tags.cTags": 1}},
//                   { $group: {
//                       _id: null,
//                       cTags: {$addToSet: '$metadata.tags.cTags'}
//                   }}
//                   ], function (err, result) {
//                       if (err) {
//                           console.log(err);
//                           res.status(500).end();
//                       }
//                       if (!result[0] || !result[0].cTags) return res.json([]);
//                       res.json(result[0].cTags);
//               });
//             // Get cTags by system group by subSystem
//           } else if (req.query.system) {
//               Document.aggregate([
//                   { $match: {'metadata.building': req.building._id, 'metadata.tags.system': req.query.system, 'status': {$ne: 'deleted'}}},
//                   { $unwind: "$metadata.tags.cTags"},
//                   { $sort: {"metadata.tags.cTags": 1}},
//                   { $group: {
//                       _id: '$metadata.tags.subSystem',
//                       cTags: {$addToSet: '$metadata.tags.cTags'}
//                   }},
//                   { $project : {
//                     system: '$_id',
//                     cTags: '$cTags',
//                     _id: false
//                   }},
//                   { $sort: {"system": 1}},
//                   ], function (err, result) {
//                       if (err) {
//                           console.log(err);
//                           res.status(500).end();
//                       }
//                       if (!result|| result.length === 0) return res.json([]);
//                       res.json(result);
//               });
//             } else {
//                 return res.status(400).json({error: 'Missing "system" and "subSystem", or "featureType" in query string'});
//             }
//
//          },
//
//         /**
//          * Delete a document
//          */
//         deleteDocument: function(req, res) {
//             if (!req.document.metadata.uploader && !req.user.isAdminUser) {
//
//             } else if (req.document.metadata.uploader && req.document.metadata.uploader.toString() !== req.user._id && !req.user.isAdminUser) {
//                 return res.status(403).end();
//             }
//             var user = new User(req.user);
//             var trashId = mongoose.Types.ObjectId();
//             var trash = new Trash({
//                 _id: trashId,
//                 collectionType: 'FsFile',
//                 type: 'documents',
//                 site: req.document.metadata.site,
//                 building: req.document.metadata.building,
//                 floor: req.document.metadata.floor,
//                 feature: req.document.metadata.feature,
//                 trashId: req.document._id,
//                 company: req.document.company,
//                 deleteDate: Date.now(),
//                 deleteUser: req.user._id
//             });
//             var fileSize = req.document.current.length;
//             var len = req.document.docs.length;
//             for (var i=0; i<len; i++) {
//                 fileSize += req.document.docs[i].length;
//             }
//             trash.save(function (err, trash) {
//                 if (err) {
//                     console.log(err);
//                     return res.status(500).end();
//                 }
//                 Document.update({_id: req.document._id}, {$set: {status: 'deleted'}}, function (err) {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).end();
//                     }
//                     Building.update({_id: req.document.metadata.building}, {$inc: {totalFileSize: -fileSize}}, function(err) {
//                         if (err) {
//                             console.log(err);
//                             return res.status(500).end();
//                         }
//                         res.status(200).end();
//                     });
//                 });
//             });
//             // Transaction.create({
//             //     app: 'Docman',
//             //     changes: [{
//             //         changeId: mongoose.Types.ObjectId(),
//             //         coll: 'documents',
//             //         act: 'update',
//             //         docId: ObjectId(req.document._id),
//             //         data: {status: 'deleted'}
//             //     },{
//             //         changeId: mongoose.Types.ObjectId(),
//             //         coll: 'trashes',
//             //         act: 'insert',
//             //         docId: ObjectId(trashId),
//             //         data: trash
//             //     },
//             //     {
//             //         changeId: mongoose.Types.ObjectId(),
//             //         coll: 'buildings',
//             //         act: 'update',
//             //         docId: ObjectId(req.document.metadata.building),
//             //         inc: {totalFileSize: -fileSize}
//             //     }]
//             // }, function(err) {
//             //     if (err) {
//             //         console.log(err);
//             //         return res.status(500).end();
//             //     }
//             //     res.status(200).end();
//             // });
//         },
//
//         /**
//          * List of documents
//          */
//         allDocuments: function(req, res) {
//             if (!req.query.buildingId) {
//               return res.status(400).json({error: 'Missing building ID in query string'});
//             }
//
//             // switch(req.query.system) {
//             //     case 'HVAC': auth.checkBuildingHVACRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'FS': auth.checkBuildingFSRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'P&D': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'Lift&Escalator': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'Electrical': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'BMS': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'ELV': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'Lighting': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             //     case 'General': auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
//             // }
//
//             if (req.query.system && req.query.subSystem && req.query.cTag) {
//                 var query = {};
//                 if (req.query.eTag) {
//                     query = Document.find({'metadata.building': req.building._id, 'company': {$in: req.user.company}, 'metadata.tags.system': req.query.system, 'metadata.tags.subSystem': req.query.subSystem, 'metadata.tags.cTags': req.query.cTag, 'metadata.tags.eTags': req.query.eTag, 'status': {$ne: 'deleted'}}, 'current metadata').populate({path: 'current.uploader', select: 'name', model: 'User'}).lean();
//                 } else {
//                     query = Document.find({'metadata.building': req.building._id, 'company': {$in: req.user.company}, 'metadata.tags.system': req.query.system, 'metadata.tags.subSystem': req.query.subSystem, 'metadata.tags.cTags': req.query.cTag, 'status': {$ne: 'deleted'}}, 'current metadata').populate({path: 'current.uploader', select: 'name', model: 'User'}).populate({path: 'metadata.tags.eTags', model: 'Equipment'}).lean();
//                 }
//
//                 query.exec(function(err, documents) {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).end();
//                     }
//                     return res.json(documents);
//                     // async.each(documents, function(document, callback) {
//                     //     Floor.findOne({'features.doc': document.current._id}, {name: 1, "features.$": 1}).exec(function(err, floor) {
//                     //         if (err) {
//                     //             console.log(err);
//                     //             return res.status(500).end();
//                     //         }
//                     //         if (floor) {
//                     //             document.metadata.location = {
//                     //                 floor: {
//                     //                     _id: floor._id,
//                     //                     name: floor.name
//                     //                 },
//                     //                 feature: {
//                     //                     _id: floor.features[0]._id,
//                     //                     name: floor.features[0].name,
//                     //                     metadata: floor.features[0].metadata
//                     //                 }
//                     //             };
//                     //         }
//                     //         callback();
//                     //     });
//                     // },
//                     // function(err) {
//                     //   if (err) {
//                     //     console.log(err);
//                     //   }
//                     //   res.json(documents);
//                     // });
//                 });
//             } else {
//                 return res.status(400).json({error: 'Missing "system", "subSystem" AND "cTag" in query string'});
//             }
//         },
//
//         allVersions: function(req, res) {
//             var document = req.document;
//             User.populate(document, [{path: 'current.uploader', select: 'name', model: 'User'}], function(err, document) {
//               document.current.isCurrent = true;
//               document.docs.push(document.current);
//               User.populate(document, [{path: 'docs.uploader', select: 'name', model: 'User'}], function(err, document) {
//                   res.json(document.docs);
//               });
//             });
//         },
//
//         showVersion: function(req, res) {
//             res.writeHead(200, {
//                 'Content-Length' : req.oldVersion.length
//             });
//             gfs.createReadStream({
//                 _id: req.oldVersion._id
//             }).pipe(res);
//         },
//
//         deleteVersion: function(req, res) {
//             if (!req.document.metadata.uploader && !req.user.isAdminUser) {
//               return res.status(403).end();
//             } else if (req.document.metadata.uploader && req.document.metadata.uploader.toString() !== req.user._id && !req.user.isAdminUser) {
//                 return res.status(403).end();
//             }
//             if (req.oldVersion._id.toString() === req.document.current._id.toString()) {
//               if (req.document.docs.length > 0) {
//                 Document.update({_id: req.document._id}, {$set: {current: req.document.docs[req.document.docs.length - 1]}, $pull: {'docs': {_id: req.document.docs[req.document.docs.length - 1]._id} }}, function(err) {
//                     Building.update({_id: req.document.metadata.building}, {$inc: {totalFileSize: -req.document.current.length}}, function(err) {
//                         if (err) {
//                             console.log(err);
//                             return res.status(500).end();
//                         }
//                         res.status(200).end();
//                     });
//                 });
//               } else {
//                 return res.status(400).json({err: 'current version cannot be deleted without older version'});
//               }
//
//             } else {
//                 Document.update({_id: req.document._id}, {$pull: {'docs': {_id: req.oldVersion._id} }}, function(err) {
//                     Building.update({_id: req.document.metadata.building}, {$inc: {totalFileSize: -req.oldVersion.length}}, function(err) {
//                         if (err) {
//                             console.log(err);
//                             return res.status(500).end();
//                         }
//                         res.status(200).end();
//                     });
//                 });
//             }
//         },
//
//         updateDocument: function(req, res) {
//             var changes = req.body;
//             var document = req.document;
//             var set = {};
//             if (!changes.filename || !changes.tags || !changes.tags.cTags || !changes.tags.eTags) {
//                 return res.status(400).json({err: 'Missing tags or filename'});
//             }
//
//             if (changes.feature && (!changes.site || !changes.building || !changes.floor)) {
//               return res.status(400).json({err: 'Missing site or building or floor'})
//             }
//
//             if (changes.floor && (!changes.site || !changes.building)) {
//               return res.status(400).json({err: 'Missing site or building'});
//             }
//
//             if (!changes.building && !changes.site) {
//               return res.status(400).json({err: 'Missing site or building'});
//             }
//
//             Building.findOne({_id: changes.building, company: {$in: req.user.company}}, 'site').lean().exec(function (err, building) {
//               if (err) {
//                 console.log(err);
//                 return res.status(500).end();
//               }
//               if (!building) return res.status(400).json({err: 'Invalid Building'});
//               if (building.site.toString() !== changes.site) return res.status(400).json({err: 'Invalid site'});
//               Floor.findOne({_id: changes.floor, building: changes.building, company: {$in: req.user.company}}, 'features').lean().exec(function (err, floor) {
//                 if (err) {
//                   console.log(err);
//                   return res.status(500).end();
//                 }
//                 if (changes.floor && !floor) return res.status(400).json({err: 'Invalid floor'});
//                 var user = new User(req.user);
//                 var query = [{ $match: {'_id': ObjectId(changes.floor), 'company': {$in: user.company}}},
//                     // { $match: {'company': {$in: user.company}}},
//                     { $project: {'features': 1}},
//                     { $unwind: "$features"},
//                     { $match: {'features._id': ObjectId(changes.feature), 'features.status': {$ne: 'deleted'}}}];
//
//                 Floor.aggregate(query, function (err, result) {
//                     if (err) {
//                         console.log(err);
//                         res.status(500).end();
//                     }
//
//                     if (changes.feature && (!result || !result[0])) return res.status(400).json({err: 'Invalid feature'});
//                     // var feature = result[0].features;
//                     Equipment.find({_id: {$in: changes.tags.eTags}, company: {$in: req.user.company}}, '_id').lean().exec(function (err, equipments) {
//                       if (err) {
//                         console.log(err);
//                         return res.status(500).end();
//                       }
//                       if (changes.tags.eTags.length !== equipments.length) return res.status(400).json({err: 'Invalid eTags'});
//                       document.metadata.site = changes.site;
//                       document.metadata.building = changes.building;
//                       document.metadata.floor = changes.floor;
//                       document.metadata.feature = changes.feature;
//                       document.metadata.desc = changes.desc;
//                       document.current.filename = changes.filename;
//                       document.metadata.tags.system = changes.tags.system;
//                       document.metadata.tags.subSystem = changes.tags.subSystem;
//                       document.metadata.tags.cTags = changes.tags.cTags;
//                       document.metadata.tags.eTags = changes.tags.eTags;
//                       document.markModified('metadata.tags.cTags');
//                       document.markModified('metadata.tags.eTags');
//                       document.save(function(err, document) {
//                           if (err) {
//                               console.log(err);
//                               return res.status(500).end();
//                           }
//                           document = document.toJSON();
//                           res.json(document);
//                       });
//                     });
//
//                 });
//               });
//
//             });
//         }
//     };
// }

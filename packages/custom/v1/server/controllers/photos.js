// 'use strict';
//
// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//     mongoosastic = require('mongoosastic'),
//     GeoJSON = require('mongodb-geojson-normalize'),
//     async = require('async'),
//     config = require('meanio').loadConfig(),
//     Transaction = require('mongoose-transact'),
//     sharp = require('sharp'),
//     _ = require('lodash');
//
// var Site = mongoose.model('Site'),
//     Building = mongoose.model('Building'),
//     Floor = mongoose.model('Floor'),
//     Equipment = mongoose.model('Equipment'),
//     User = mongoose.model('User'),
//     Photo = mongoose.model('Photo'),
//     FsFile = mongoose.model('FsFile'),
//     Document = mongoose.model('Document'),
//     Trash = mongoose.model('Trash');
//
// var ObjectId = mongoose.Types.ObjectId;
//
// var elasticsearch = require('elasticsearch');
// var client = new elasticsearch.Client({
//   host: config.elasticsearch.host
// });
//
// module.exports = function(FloorPlan) {
//
//     return {
//         /**
//          * Find photo by id
//          */
//         photo: function(req, res, next, id) {
//           if (!req.user) return res.status(401).end();
//           Document.findOne({_id: id, type: 'photos', company: {$in: req.user.company}, status: {$ne: 'deleted'}}, '-status -company').lean().exec(function(err, document) {
//             if (err) {
//               console.log(err);
//               return res.status(500).end();
//             }
//             if (!document) return res.status(404).end();
//             req.photo = document;
//             next();
//           });
//         },
//
//         /**
//          * Find old version by id
//          */
//         version: function(req, res, next, id) {
//           if (!req.user) return res.status(401).end();
//           var user = new User(req.user);
//           var query = [{ $match: {'docs._id': ObjectId(id), 'company': {$in: user.company}, 'status': {$ne: 'deleted'}}},
//               { $project: {'docs': 1}},
//               { $unwind: "$docs"},
//               { $match: {'docs._id': ObjectId(id)}}];
//
//           Document.aggregate(query, function (err, result) {
//               if (err) {
//                   console.log(err);
//                   res.status(500).end();
//               }
//               if (!result || !result[0]) {
//                   Document.findOne({'current._id': id, company: {$in: user.company}, 'status': {$ne: 'deleted'}}, 'current', function(err, oldVersion) {
//                       if (err) {
//                           console.log(err);
//                           res.status(500).end();
//                       }
//                       if (!oldVersion) return res.status(404).end();
//                       req.oldVersion = oldVersion;
//                       next();
//                   });
//               } else {
//                   req.oldVersion = result[0].docs;
//                   next();
//               }
//           });
//         },
//
//         /**
//          * List versions
//          */
//         allVersions: function(req, res) {
//           req.photo.docs.push(req.photo.current);
//           res.json(req.photo.docs);
//         },
//
//         /**
//          * Show photo
//          */
//         show: function(req, res) {
//           res.writeHead(200, {
//               'Content-Type': 'image/jpeg'
//           });
//           var stream = Photo.findOne({_id: req.photo.current._id}, 'photoUrl').stream();
//           stream.on('data', function (photo) {
//             res.write(photo.photoUrl[0]);
//           });
//
//           stream.on('error', function (err) {
//             console.log(err);
//             return res.status(500).end();
//           });
//
//           stream.on('close', function () {
//             res.end();
//           });
//         },
//
//         showVersion: function(req, res) {
//           res.writeHead(200, {
//               'Content-Type': 'image/jpeg'
//           });
//           var stream = Photo.findOne({_id: req.oldVersion._id}, 'photoUrl').stream();
//           stream.on('data', function (photo) {
//             res.write(photo.photoUrl[0]);
//           });
//
//           stream.on('error', function (err) {
//             console.log(err);
//             return res.status(500).end();
//           });
//
//           stream.on('close', function () {
//             res.end();
//           });
//         },
//
//         /**
//          * Delete photo of features
//          */
//         deletePhoto: function(req, res) {
//           var photo = req.photo;
//           if (!photo.metadata && !photo.metadata.uploader && photo.metadata.uploader.toString() !== req.user._id && !req.user.isAdminUser) {
//             return res.status(403).end();
//           }
//           var trashId = mongoose.Types.ObjectId();
//           var trash = new Trash({
//               _id: trashId,
//               collectionType: 'Photo',
//               type: 'photos',
//               site: photo.metadata.site,
//               building: photo.metadata.building,
//               floor: photo.metadata.floor,
//               feature: photo.metadata.feature,
//               trashId: photo._id,
//               company: photo.company,
//               deleteDate: Date.now()
//           });
//           var photoSize = photo.current.length;
//           var len = photo.docs.length;
//           for (var i; i<len; i++) {
//             photoSize += photo.docs[i].length;
//           }
//           trash.save(function(err, trash) {
//             if (err) {
//               console.log(err);
//               return res.status(500).end();
//             }
//             Document.update({_id: photo._id}, {$set: {status: 'deleted'}}, function(err) {
//               if (err) {
//                 console.log(err);
//                 return res.status(500).end();
//               }
//               Building.update({_id: photo.metadata.building}, {$inc: {totalPhotoSize: -photoSize}}, function(err) {
//                 if (err) {
//                   console.log(err);
//                   return res.status(500).end();
//                 }
//                 res.status(200).end();
//               });
//             });
//           });
//           // Transaction.create({
//           //     app: 'Docman',
//           //     changes: [{
//           //         changeId: mongoose.Types.ObjectId(),
//           //         coll: 'documents',
//           //         act: 'update',
//           //         docId: ObjectId(photo._id),
//           //         data: {status: 'deleted'}
//           //     },{
//           //         changeId: mongoose.Types.ObjectId(),
//           //         coll: 'trashes',
//           //         act: 'insert',
//           //         docId: ObjectId(trashId),
//           //         data: trash
//           //     },
//           //     {
//           //       changeId: mongoose.Types.ObjectId(),
//           //       coll: 'buildings',
//           //       act: 'update',
//           //       docId: ObjectId(photo.metadata.building),
//           //       inc: {
//           //         totalPhotoSize: -photoSize
//           //       }
//           //     }]
//           // }, function(err) {
//           //     if (err) {
//           //         console.log(err);
//           //         return res.status(500).end();
//           //     }
//           //     res.status(200).end();
//           // });
//         },
//
//         deleteVersion: function(req, res) {
//             if (!req.document.metadata.uploader && !req.user.isAdminUser) {
//
//             } else if (req.document.metadata && req.document.metadata.uploader && req.document.metadata.uploader.toString() !== req.user._id && !req.user.isAdminUser) {
//                 return res.status(403).end();
//             }
//
//             if (req.oldVersion._id.toString() === req.document.current._id.toString()) {
//               if (req.document.docs.length > 0) {
//                 Document.update({_id: req.document._id}, {$set: {current: req.document.docs[req.document.docs.length - 1]}, $pull: {'docs': {_id: req.document.docs[req.document.docs.length - 1]._id}}}, function(err) {
//                     Building.update({_id: req.document.metadata.building}, {$inc: {totalPhotoSize: -req.document.current.length}}, function(err) {
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
//                     Building.update({_id: req.document.metadata.building}, {$inc: {totalPhotoSize: -req.oldVersion.length}}, function(err) {
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
//         updatePhoto: function(req, res) {
//           if (req.query.orientation) {
//             var degree = 0;
//             if (req.query.orientation === 'left') {
//               degree = 270;
//             } else {
//               degree = 90;
//             }
//             Photo.findOne({_id: req.photo.current._id}, 'photoUrl', function(err, photo) {
//               if (err) {
//                 console.log(err);
//                 return res.status(500).end();
//               }
//               if (!photo) return res.status(404).end();
//               sharp(photo.photoUrl[0])
//               .rotate(degree)
//               .progressive()
//               .quality(70)
//               .toBuffer(function (err, editedImage) {
//                 Photo.update({_id: photo._id}, {$set: {'photoUrl.0': editedImage}}, function(err) {
//                   if (err) {
//                     console.log(err);
//                     return res.status(500).end();
//                   }
//                   res.send(editedImage);
//                 });
//               });
//             });
//           } else {
//             res.status(400).json({err: 'No suitable query string'});
//           }
//
//         }
//     };
// }

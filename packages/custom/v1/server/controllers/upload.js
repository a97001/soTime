// 'use strict';
//
// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//   Site = mongoose.model('Site'),
//   Building = mongoose.model('Building'),
//   Floor = mongoose.model('Floor'),
//   Photo = mongoose.model('Photo'),
//   User = mongoose.model('User'),
//   Document = mongoose.model('Document'),
//   // GeoJSON = require('mongodb-geojson-normalize'),
//   async = require("async"),
//   Grid = require('gridfs-stream'),
//   fs = require('fs'),
//   // gm = require('gm'),
//   sharp = require('sharp'),
//   Transaction = require('mongoose-transact'),
//   _ = require('lodash');
//
// var ObjectId = mongoose.Types.ObjectId;
// Grid.mongo = mongoose.mongo;
// var gfs = Grid(mongoose.connection.db, mongoose.mongo);
//
// var zlib = require('zlib');
// var gzip = zlib.createGzip();
//
// /**
//  * jQuery upload options
//  */
// var uploaderOptions = {
//   tmpDir: '',
//   uploadDir: '',
//   uploadUrl: '/utility/v1/upload/document/',
//   useSSL: true,
//   copyImgAsThumb: true,
//   imageVersions: {
//     width: 100,
//     height: 'auto'
//   },
//   storage: {
//     type: 'local'
//   }
// };
//
// module.exports = function(FloorPlan) {
//
//   return {
//
//     /**
//      * Filename param
//      */
//     filename: function(req, res, next, filename) {
//       req.filename = filename;
//       next();
//     },
//
//
//     /**
//      * get document
//      */
//     getDoc: function(req, res) {
//       var options = {
//         root: '/uploaded/files/' + req.user.email + '/',
//         dotfiles: 'deny'
//       };
//       res.sendFile(req.filename, options, function(err) {
//         if (err) {
//           console.log(err);
//           return res.status(err.status).end();
//         }
//       });
//     },
//
//     /**
//      * get document thumbnail
//      */
//     getDocThumbnail: function(req, res) {
//       var options = {
//         root: '/uploaded/files/' + req.user.email + '/thumbnail/',
//         dotfiles: 'deny'
//       };
//       res.sendFile(req.filename, options, function(err) {
//         if (err) {
//           console.log(err);
//           return res.status(err.status).end();
//         }
//       });
//     },
//
//
//     /**
//      * get upload document
//      */
//     getUploadDocument: function(req, res) {
//       uploaderOptions.tmpDir = '/uploaded/tmp/' + req.user.email;
//       uploaderOptions.uploadDir = '/uploaded/files/' + req.user.email;
//       var uploader = require('blueimp-file-upload-expressjs')(uploaderOptions);
//       uploader.get(req, res, function(obj) {
//         return res.send(JSON.stringify(obj));
//       });
//     },
//
//     /**
//      * post upload document
//      */
//     postUploadDocument: function(req, res) {
//       uploaderOptions.tmpDir = '/uploaded/tmp/' + req.user.email;
//       uploaderOptions.uploadDir = '/uploaded/files/' + req.user.email;
//       var uploader = require('blueimp-file-upload-expressjs')(uploaderOptions);
//       uploader.post(req, res, function(obj) {
//         return res.send(JSON.stringify(obj));
//       });
//     },
//
//     /**
//      * delete upload document
//      */
//     deleteUploadDocument: function(req, res) {
//       uploaderOptions.tmpDir = '/uploaded/tmp/' + req.user.email;
//       uploaderOptions.uploadDir = '/uploaded/files/' + req.user.email;
//       var uploader = require('blueimp-file-upload-expressjs')(uploaderOptions);
//       uploader.delete(req, res, function(obj) {
//         return res.send(JSON.stringify(obj));
//       });
//     },
//     /**
//      * Show feature by id
//      */
//
//     processUpload: function(req, res) {
//       var user = new User(req.user);
//       var body = req.body;
//       var system = body.system,
//         subSystem = body.subSystem,
//         cTags = body.cTags,
//         eTags = body.eTags,
//         buildingId = body.buildingId,
//         floorId = body.floorId,
//         featureId = body.featureId,
//         files = body.uploadedDocs,
//         isEquipment = body.isEquipment,
//         isPhoto = body.isPhoto,
//         email = user.email,
//         models = body.models;
//
//
//       var building = null,
//         floor = null,
//         feature = null;
//
//       if (!files || !files instanceof Array) {
//         return res.json(400).json({
//           error: "Missing files"
//         });
//       }
//
//       if (isEquipment && (!system || !subSystem || !cTags || !cTags instanceof Array || !eTags || !eTags instanceof Array || !buildingId)) {
//         removeAllFiles(files, email, function() {
//           return res.status(400).json({
//             error: "Missing system, subSystem eTags, buildingId or cTags"
//           });
//         });
//       }
//
//       if (!isEquipment && subSystem && subSystem == 'Equipment' && (!system || !cTags || !cTags instanceof Array || !buildingId || !models || !models instanceof Array)) {
//         removeAllFiles(files, email, function() {
//           return res.status(400).json({
//             error: "Missing system, subSystem, buildingId, models or cTags"
//           });
//         });
//       }
//
//       if (!isEquipment && subSystem && subSystem == 'Floor' && (!system || !cTags || !cTags instanceof Array || !buildingId || !floorId)) {
//         removeAllFiles(files, email, function() {
//           return res.status(400).json({
//             error: "Missing system, subSystem, buildingId, floorId or cTags"
//           });
//         });
//       }
//
//       if (!isEquipment && (!system || !subSystem || !cTags || !cTags instanceof Array || !buildingId || !floorId || !featureId)) {
//         removeAllFiles(files, email, function() {
//           return res.status(400).json({
//             error: "Missing system, subSystem, buildingId, floorId, featureId or cTags"
//           });
//         });
//       }
//
//       // if (isEquipment && (!system || !subSystem || !cTags || !cTags instanceof Array)) {
//       //   removeAllFiles(files, email, function() {
//       //     return res.status(400).json({
//       //       error: "Missing system, subSystem or cTags"
//       //     });
//       //   });
//       // }
//       //
//       // if (!isEquipment && subSystem == 'Equipment' && (!models && !models instanceof Array)) {
//       //   removeAllFiles(files, email, function() {
//       //     return res.status(400).json({
//       //       error: "Missing modes or models is not an array"
//       //     });
//       //   });
//       // }
//       //
//       // if (!buildingId && !floorId && !featureId) {
//       //   removeAllFiles(files, email, function() {
//       //     return res.status(400).json({
//       //       error: "Missing buildingId, floorId or featureId"
//       //     });
//       //   });
//       // }
//       async.parallel({
//           building: function(callback) {
//             if (buildingId) {
//               Building.findOne({
//                 _id: buildingId,
//                 company: {
//                   $in: req.user.company
//                 }
//               }).lean().exec(function(err, building) {
//                 if (err) {
//                   console.log(err);
//                 }
//                 callback(err, building);
//               });
//             } else {
//               callback(null, null)
//             }
//           },
//           floor: function(callback) {
//             if (floorId) {
//               Floor.findOne({
//                 _id: floorId,
//                 company: {
//                   $in: req.user.company
//                 }
//               }).lean().exec(function(err, floor) {
//                 if (err) {
//                   console.log(err);
//                 }
//                 callback(err, floor);
//               });
//             } else {
//               callback(null, null)
//             }
//           },
//           feature: function(callback) {
//             if (featureId) {
//               var query = [{
//                 $match: {
//                   '_id': ObjectId(floorId),
//                   'company': {
//                     $in: user.company
//                   }
//                 }
//               }, {
//                 $project: {
//                   'features': 1
//                 }
//               }, {
//                 $unwind: "$features"
//               }, {
//                 $match: {
//                   'features._id': ObjectId(featureId)
//                 }
//               }];
//
//               Floor.aggregate(query, function(err, result) {
//                 if (err) {
//                   console.log(err);
//                 }
//                 if (!result || !result[0]) {
//                   callback(err, null);
//                 } else {
//                   callback(err, result[0].features);
//                 }
//               });
//             } else {
//               callback(null, null);
//             }
//           },
//           equipment: function(callback) {
//             if (eTags) {
//               Equipment.find({
//                 _id: {$in: eTags},
//                 company: {
//                   $in: req.user.company
//                 }
//               }).lean().exec(function(err, equipments) {
//                 if (err) {
//                   console.log(err);
//                 }
//                 callback(err, equipments);
//               });
//             } else {
//               callback(null, null)
//             }
//           },
//           model: function(callback) {
//             if (models) {
//               EquipmentModel.find({
//                 _id: {$in: models},
//                 company: {
//                   $in: req.user.company
//                 }
//               }).lean().exec(function(err, equipmentModels) {
//                 if (err) {
//                   console.log(err);
//                 }
//                 callback(err, equipmentModels);
//               });
//             } else {
//               callback(null, null)
//             }
//           }
//         },
//         function(err, results) {
//           building = results.building;
//           floor = results.floor;
//           feature = results.feature;
//           equipmentModels = results.model;
//           equipments = results.equipment;
//
//           if (err) {
//             removeAllFiles(files, email, function() {
//               return res.status(500).json({
//                 error: "Errors"
//               });
//             });
//           }
//
//           if (isEquipment && (!system || !subSystem || !cTags || !cTags instanceof Array || eTags.length !== equipments.length || !building)) {
//             removeAllFiles(files, email, function() {
//               return res.status(400).json({
//                 error: "Invalid building or equipments"
//               });
//             });
//           }
//
//           if (!isEquipment && subSystem && subSystem == 'Equipment' && (!system || !cTags || !cTags instanceof Array || !building || models.length !== equipmentModels.length)) {
//             removeAllFiles(files, email, function() {
//               return res.status(400).json({
//                 error: "Invalid models or building"
//               });
//             });
//           }
//
//           if (!isEquipment && subSystem && subSystem == 'Floor' && (!system || !cTags || !cTags instanceof Array || !building || !floor)) {
//             removeAllFiles(files, email, function() {
//               return res.status(400).json({
//                 error: "Invalid building or floor"
//               });
//             });
//           }
//
//           if (!isEquipment && (!system || !subSystem || !cTags || !cTags instanceof Array || !building || !floor || !feature)) {
//             removeAllFiles(files, email, function() {
//               return res.status(400).json({
//                 error: "Invalid building, floor or feature"
//               });
//             });
//           }
//
//           if (isPhoto) {
//             async.each(files, function(file, callback) {
//               processPhoto(callback, user, email, file.name, building, floor, feature, eTags);
//             }, function(err) {
//               if (err) {
//                 console.log(err);
//               }
//               res.status(200).end();
//             });
//           } else {
//             async.each(files, function(file, callback) {
//               processDocument(callback, user, email, file.name, eTags, file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase(), system, subSystem, cTags, building, floor, feature, isEquipment, models);
//             }, function(err) {
//               if (err) {
//                 console.log(err);
//               }
//               res.status(200).end();
//             });
//           }
//
//
//
//
//
//
//
//
//
//         //   if (err || !building || (feature && !floor)) {
//         //     removeAllFiles(files, email, function() {
//         //       return res.status(400).json({
//         //         error: "Invalid buildingId, floorId or featureId"
//         //       });
//         //     });
//         //   }
//         //   if (isPhoto && building && floor && feature) {
//         //     async.each(files, function(file, callback) {
//         //       processPhoto(callback, user, email, file.name, building, floor, feature);
//         //     }, function(err) {
//         //       if (err) {
//         //         console.log(err);
//         //       }
//         //       res.status(200).end();
//         //     });
//         //   } else if (isPhoto) {
//         //     removeAllFiles(files, email, function() {
//         //       return res.status(400).json({
//         //         error: "Invalid buildingId, floorId or featureId"
//         //       });
//         //     });
//         //   } else {
//         //     async.each(files, function(file, callback) {
//         //       processDocument(callback, user, email, file.name, eTags, file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase(), system, subSystem, cTags, building, floor, feature, isEquipment);
//         //     }, function(err) {
//         //       if (err) {
//         //         console.log(err);
//         //       }
//         //       res.status(200).end();
//         //     });
//         //   }
//         // });
//       });
//     }
//   }
// }
//
//
// function processPhoto(callback, user, email, fileName, building, floor, feature, eTags) {
//   fs.readFile('/uploaded/files/' + email + '/' + fileName, function(err, image) {
//     sharp(image)
//       .resize(1200, 1200)
//       .max()
//       .rotate()
//       .progressive()
//       .quality(70)
//       .toFormat('jpeg')
//       .toBuffer(function(err, editedImage) {
//         if (err) {
//           console.log(err);
//         }
//         var photo = new Photo({
//           _id: mongoose.Types.ObjectId(),
//           filename: fileName,
//           photoUrl: [editedImage],
//           uploader: user._id,
//           uploadDate: new Date(),
//           length: editedImage.length
//
//         });
//         photo.save(function(err, savedPhoto) {
//           var document = new Document({
//             type: 'photos',
//             current: {
//               _id: savedPhoto._id,
//               filename: savedPhoto.filename,
//               uploader: savedPhoto.uploader,
//               uploadDate: savedPhoto.uploadDate,
//               length: savedPhoto.length
//             },
//             docs: [],
//             metadata: {
//               site: building.site,
//               building: building._id,
//               floor: null,
//               feature: null,
//               models: []
//             },
//             company: floor.company,
//             status: 'approved'
//           });
//           if (floor) {
//             document.metadata.floor = floor._id;
//           }
//           if (feature) {
//             document.metadata.feature = feature._id;
//           }
//           if (eTags) {
//             document.metadata.tags.eTags = eTags;
//           } else {
//             document.metadata.tags.eTags = [];
//           }
//           document.save(function(err, document) {
//             Building.update({
//               _id: building._id
//             }, {
//               $inc: {
//                 totalPhotoSize: savedPhoto.length
//               }
//             }, function(err) {
//               fs.exists('/uploaded/files/' + email + '/' + fileName, function(exists) {
//                 removeFile(email, fileName, callback);
//               });
//             });
//           });
//         });
//       });
//   });
// }
//
// function processDocument(callback, user, email, fileName, eTags, fileType, system, subSystem, cTags, building, floor, feature, isEquipment, models) {
//   fs.readFile('/uploaded/files/' + email + '/' + fileName, function(err, data) {
//     var fl = {
//       base: data
//     };
//     zlib.gzip(fl.base, function(_, result) { // The callback will give you the
//       if (eTags) {
//         for (var i = 0; i < eTags.length; i++) {
//           eTags[i] = ObjectId(eTags[i]);
//         }
//       }
//       var gridFile = {
//         filename: fileName,
//         content_type: fileType,
//         metadata: {
//           uploader: user._id
//         },
//         mode: 'w'
//       };
//       var writestream = gfs.createWriteStream(gridFile);
//       fs.createReadStream('/uploaded/files/' + email + '/' + fileName).pipe(writestream); //Upload file path
//       writestream.on('close', function(file) {
//         var document = new Document({
//           type: 'documents',
//           current: {
//             _id: file._id,
//             filename: file.filename,
//             uploader: file.metadata.uploader,
//             uploadDate: file.uploadDate,
//             contentType: fileType,
//             length: file.length,
//             chunkSize: file.chunkSize,
//             aliases: file.aliases,
//             md5: file.md5
//           },
//           docs: [],
//           metadata: {
//             tags: {
//               system: system,
//               subSystem: subSystem,
//               cTags: cTags,
//               eTags: eTags
//             },
//             desc: 'description',
//             uploader: user._id,
//             site: building.site,
//             building: building._id,
//             floor: null,
//             feature: null
//           },
//           company: building.company,
//           status: 'approved'
//         });
//         if (floor) {
//           document.metadata.floor = floor._id;
//         }
//         if (feature) {
//           document.metadata.feature = feature._id;
//         }
//         if (eTags) {
//           document.metadata.tags.eTags = eTags;
//         } else {
//           document.metadata.tags.eTags = [];
//         }
//         if (models) {
//           document.metadata.models = models;
//         } else {
//           document.metadata.models = [];
//         }
//
//         document.save(function(err, document) {
//           Building.update({
//             _id: building
//           }, {
//             $inc: {
//               totalFileSize: file.length
//             }
//           }, function(err) {
//             removeFile(email, fileName, callback);
//           });
//         });
//       });
//     });
//   });
// }
//
// function removeAllFiles(files, email, callback) {
//   async.each(files, function(file, callback) {
//     fs.exists('/uploaded/files/' + email + '/' + file.name, function(exists) {
//       if (exists) {
//         fs.unlink('/uploaded/files/' + email + '/' + file.name, function(err) {
//
//           fs.exists('/uploaded/files/' + email + '/thumbnail/' + file.name, function(exists) {
//             if (exists) {
//               fs.unlink('/uploaded/files/' + email + '/thumbnail/' + file.name, function(err) {
//                 callback(err);
//               });
//             } else {
//               callback(err);
//             }
//           });
//         });
//       } else {
//         callback(err);
//       }
//     });
//   }, function(err) {
//     if (err) {
//       console.log(err);
//     }
//     callback();
//   });
// }
//
// function removeFile(email, fileName, callback) {
//   fs.exists('/uploaded/files/' + email + '/' + fileName, function(exists) {
//     if (exists) {
//       fs.unlink('/uploaded/files/' + email + '/' + fileName, function(err) {
//
//         fs.exists('/uploaded/files/' + email + '/thumbnail/' + fileName, function(exists) {
//           if (exists) {
//             fs.unlink('/uploaded/files/' + email + '/thumbnail/' + fileName, function(err) {
//               callback(err);
//             });
//           } else {
//             callback(err);
//           }
//         });
//       });
//     } else {
//       callback(err);
//     }
//   });
// }

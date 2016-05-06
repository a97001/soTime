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
//   sharp = require('sharp'),
//   Transaction = require('mongoose-transact'),
//   formidable = require('formidable'),
//   _ = require('lodash');
//
// var ObjectId = mongoose.Types.ObjectId;
// Grid.mongo = mongoose.mongo;
// var gfs = Grid(mongoose.connection.db, mongoose.mongo);
//
// var zlib = require('zlib');
// var gzip = zlib.createGzip();
//
// module.exports = function(FloorPlan) {
//
//     return {
//         /**
//          * Show feature by id
//          */
//
//         processUpload: function(req, res) {
//           var form = new formidable.IncomingForm();
//           form.parse(req, function(err, fields, files) {
//             var file = files.file;
//             var type = fields.type;
//             var documentId = fields.id;
//             var user = new User(req.user);
//
//             if (!file) {
//               return res.status(400).json({error: "Missing files"});
//             }
//             if (!type || !documentId) {
//               return res.status(400).json({error: "Missing type or documentId"});
//             }
//                     console.log(file);
//                     console.log(file.name); //original name (ie: sunset.png)
//                     console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
//                 // console.log(uploadPath); //uploads directory: (ie: /home/user/data/uploads)
//             Document.findOne({_id: documentId, company: {$in: user.company}}).exec(function(err, document) {
//               if (err) {
//                 console.log(err);
//                 return res.status(500).end();
//               }
//               if (!document) return res.status(404).json({err: 'document not found'});
//               switch (type) {
//                 case 'photos':
//                   updatePhotoVersion(user, file, document, res);
//                   break;
//                 case 'documents':
//                   updateDocumentVersion(user, file, file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase(), document, res);
//                   break;
//                 default:
//                   return res.status(404).json({err: 'wrong type'});
//               }
//             });
//
//           });
//         }
//     };
// }
//
// function updateDocumentVersion(user, file, fileType, document, res) {
//   fs.readFile(file.path, function(err, data) {
//       var fl = {
//           base: data,
//       };
//       zlib.gzip(fl.base, function (_, result) {  // The callback will give you the
//           var gridFile = {
//               filename: file.name,
//               content_type: fileType,
//               metadata: {
//                 uploader: user._id
//               },
//               mode: 'w'
//           };
//           var writestream = gfs.createWriteStream(gridFile);
//           fs.createReadStream(file.path).pipe(writestream);  //Upload file path
//           writestream.on('error', function (err) {
//             removeFile(file, function() {
//               return res.status(500).end();
//             });
//           });
//           writestream.on('close', function (fsfile) {
//             Document.update({_id: document._id}, {
//               $set: {
//                 current: {
//                   _id: fsfile._id,
//                   filename: fsfile.filename,
//                   uploader: fsfile.metadata.uploader,
//                   uploadDate: fsfile.uploadDate,
//                   contentType: fileType,
//                   length: fsfile.length,
//                   chunkSize: fsfile.chunkSize,
//                   aliases: fsfile.aliases,
//                   md5: fsfile.md5
//                 }
//               },
//               $push: {
//                 docs: document.current
//               }
//             }, function(err) {
//               if (err) {
//                 console.log(err);
//                 removeFile(file, function() {
//                   return res.status(500).end();
//                 });
//               } else {
//                 Building.update({_id: document.metadata.building}, {$inc: {totalFileSize: fsfile.length}}, function(err) {
//                   if (err) {
//                     console.log(err);
//                     removeFile(file, function() {
//                       return res.status(500).end();
//                     });
//                   } else {
//                     removeFile(file, function() {
//                       res.status(200).end();
//                     });
//                   }
//                 });
//               }
//             });
//             // Transaction.create({
//             //     app: 'Docman',
//             //     changes: [{
//             //         changeId: mongoose.Types.ObjectId(),
//             //         coll: 'documents',
//             //         act: 'update',
//             //         docId: ObjectId(document._id),
//             //         data: {
//             //           current: {
//             //             _id: fsfile._id,
//             //             filename: fsfile.filename,
//             //             uploader: fsfile.metadata.uploader,
//             //             uploadDate: fsfile.uploadDate,
//             //             contentType: fileType,
//             //             length: fsfile.length,
//             //             chunkSize: fsfile.chunkSize,
//             //             aliases: fsfile.aliases,
//             //             md5: fsfile.md5
//             //           }},
//             //         push: {
//             //           to: 'docs',
//             //           data: document.current
//             //         }
//             //     },
//             //     {
//             //         changeId: mongoose.Types.ObjectId(),
//             //         coll: 'buildings',
//             //         act: 'update',
//             //         docId: ObjectId(document.metadata.building),
//             //         inc: {totalFileSize: fsfile.length}
//             //     }]
//             // }, function(err) {
//             //   if (err) {
//             //     console.log(err);
//
//             //   } else {
//             //     removeFile(file, function() {
//             //       res.status(200).end();
//             //     });
//             //   }
//             // });
//           });
//       });
//   });
// }
//
// function updatePhotoVersion(user, file, document, res) {
//   fs.readFile(file.path, function(err, image) {
//         sharp(image)
//         .resize(1200, 1200)
//         .max()
//         .rotate()
//         .progressive()
//         .quality(70)
//         .toFormat('jpeg')
//         .toBuffer(function (err, editedImage) {
//             if (err) {
//                 console.log(err);
//             }
//             var photo = new Photo({
//                 _id: mongoose.Types.ObjectId(),
//                 filename: file.name,
//                 photoUrl: [editedImage],
//                 uploader: user._id,
//                 uploadDate: new Date(),
//                 length: editedImage.length
//             });
//             photo.save(function(err, savedPhoto) {
//               Document.update({_id: document._id}, {
//                 $set: {
//                   current: {
//                     _id: savedPhoto._id,
//                     filename: savedPhoto.filename,
//                     uploader: savedPhoto.uploader,
//                     uploadDate: savedPhoto.uploadDate,
//                     length: savedPhoto.length
//                   }
//                 },
//                 $push: {
//                   docs: document.current
//                 }
//               }, function(err) {
//                 if (err) {
//                   console.log(err);
//                   removeFile(file, function() {
//                     return res.status(500).end();
//                   });
//                 } else {
//                  Building.update({_id: document.metadata.building}, {$inc: {totalPhotoSize: savedPhoto.length}}, function(err) {
//                    if (err) {
//                      console.log(err);
//                      removeFile(file, function() {
//                        return res.status(500).end();
//                      });
//                    } else {
//                     removeFile(file, function() {
//                       return res.status(200).end();
//                     });
//                    }
//                  });
//                 }
//               });
//               // Transaction.create({
//               //     app: 'Docman',
//               //     changes: [{
//               //         changeId: mongoose.Types.ObjectId(),
//               //         coll: 'documents',
//               //         act: 'update',
//               //         docId: ObjectId(document._id),
//               //         data: {current: {
//               //           _id: savedPhoto._id,
//               //           filename: savedPhoto.filename,
//               //           uploader: savedPhoto.uploader,
//               //           uploadDate: savedPhoto.uploadDate,
//               //           length: savedPhoto.length
//               //         }},
//               //         push: {
//               //           to: 'docs',
//               //           data: document.current
//               //         }
//               //     },
//               //     {
//               //         changeId: mongoose.Types.ObjectId(),
//               //         coll: 'buildings',
//               //         act: 'update',
//               //         docId: ObjectId(document.metadata.building),
//               //         inc: {totalPhotoSize: savedPhoto.length}
//               //     }]
//               // }, function(err) {
//               //   if (err) {
//               //     console.log(err);
//               //     removeFile(file, function() {
//               //       return res.status(500).end();
//               //     });
//               //   } else {
//               //     removeFile(file, function() {
//               //       return res.status(200).end();
//               //     });
//               //   }
//               // });
//             });
//         })
//
//     });
// }
//
// function removeFile(file, callback) {
//   fs.exists(file.path, function (exists) {
//     if (exists) {
//       fs.unlink(file.path, function(err) {
//         callback();
//       });
//     } else {
//       callback();
//     }
//   });
// }

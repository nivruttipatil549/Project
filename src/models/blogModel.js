

const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, 'Title Is Required'],
        trim: true
    },

    body: {
        type: String,
        required: [true, 'Body Should Not Be Empty'],
        trim: true
    },

    authorId: {
        type: ObjectId,
        required: [true, 'Author Id is Required'],
        ref: "Author"

    },

    tags: [  { type: String, required: [true, 'tags are required'] } ],

    
    category: {
        type: String,
        trim : true ,
        required: [true, 'category is Required']
    },
    subcategory:[
       { type: String, trim : true }
    ],

    isPublished: {
        type: Boolean,
        default: false

    },
    publishedAt: {
        type: Date,
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });


module.exports = mongoose.model('Blog', blogSchema)

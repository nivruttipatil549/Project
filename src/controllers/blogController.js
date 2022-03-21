
const blogModel = require("../models/blogModel")
const AuthorModel = require("../models/AuthorModel")
const { default: mongoose } = require("mongoose")


const isValid = (value) => {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true ;
}

const isValidRequestBody = (requestBody) => {
    return Object.keys(requestBody).length > 0
}

const isValidobjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}


////     creating_Blog    /////


const createBlog = async (req, res) => {

    try {
        let requestBody = req.body

        const authorIdFromToken = req.authorId

        if (!isValidobjectId(authorIdFromToken)) {
            res.status(400).send( { status : false , message : `${authorIdFromToken} is Not a Valid token id` } )
            return
        }

        
        if(!isValidRequestBody(requestBody)) {
            res.status(400).send( { status : false , message : "Invalid request parameteres . please provide Blog details" } )
            return
        }
       
        const { title , body , authorId , tags, category, subcategory, isPublished } = requestBody

        if(authorId != authorIdFromToken) {
            res.status(401).send({status : false , message : 'Unauthrized Access'})
            return
        }

        if(!isValid(title)) {
            res.status(400).send( { status : false , message : 'Blog Title Is Required' } )
            return
        }

        if(!isValid(body)) {
            res.status(400).send( { status : false , message : 'Blog Is Required' } )
            return
        }

        if(!isValid(authorId)) {
            res.status(400).send( { status : false , message : 'Author Id Is Required' } )
            return
        }

        if(!isValidobjectId(authorId)) {
            res.status(400).send( { status : false , message : `${authorId} is Not a Valid authorId`})
            return
        }

        if(!isValid(category)) {
            res.status(400).send( { Status : false , message : 'Blog Category Is Required' } )
            return
        }
        

        let author = await AuthorModel.findById(authorId)

        if (!author) {
            return res.status(404).send({ msg: "Author Not Found" })
        }

        const blogData = {
            title,
            body, 
            authorId,
            category,
            isPublished : isPublished ? isPublished : false ,
            publishedAt : isPublished ? new Date() : null
        }

        if(tags) {
            if(Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags) === '[object String]') {
                blogData['tags'] = [ tags ]
            }
        }

        if(subcategory) {
            if(Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory) === '[object String]') {
                blogData['subcategory'] = [ subcategory ]
            }
        }


        let blogCreated = await blogModel.create(blogData)
        if(!blogCreated){
            return res.status(400).send({Status:false, msg : "Invalid Request"})
        }
        return res.status(201).send({ Status : true ,message : "Blog Created Successfully" ,data: blogCreated })

    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}


////    getting blog    ////


const getBlogs = async function (req, res) {

    try {
        const filterQuery = { isDeleted : false , deletedAt : null , isPublished : true }
        let queryParams = req.query

        if(isValidRequestBody(queryParams)) {
          const {authorId , category , tags, subcategory} = queryParams 

            if(isValid(authorId) && isValidobjectId(authorId)) {
                filterQuery['authorId'] = authorId
            }

            if(isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if(isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = {$all : tagsArr}
            }

            if(isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim());
                filterQuery['subcategory'] = {$all : subcatArr}
            }
        }

        const blogs = await blogModel.find(filterQuery)

        if( Array.isArray(blogs) && blogs.length === 0 ) {
            res.status(404).send( { status : false , message : "No Blogs Found" } )
            return
        }

        res.status(200).send( { status : true , message : 'blogs List', Data : blogs  } )
       

    } catch (err) {
        res.status(500).send( { Status : false ,Error: err.message } )
    }
}



////     Updating_Blog       ////


const updateBlogs = async (req, res) => {

    try {
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        // validations...

        if (!isValidobjectId(blogId)) {
            res.status(400).send( { status : false , message : `${blogId} is Not a Valid Blog id` } )
            return
        }

        if (!isValidobjectId(authorIdFromToken)) {
            res.status(400).send( { status : false , message : `${authorIdFromToken} is Not a Valid token id` } )
            return
        }

        const blog = await blogModel.findOne( { _id: blogId, isDeleted: false, deletedAt: null } )

        if(!blog) {
            res.status(404).send({ status : false , message : "Blog Not Found" } )
            return
        }

        if(blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send( { status : false , message : 'Unauthorized access ! Owner Info dosent match' } )
            return
        }

        if(!isValidRequestBody(requestBody)) {
            res.status(200).send( { status : false , message : 'No parameters Passed. Blog unmodified', Data : blog } )
            return
        }

        ////  Extracting Params  ////

        const {title, body, tags, category, subcategory, isPublished} = requestBody

        const updateBlogData = {}

        if(isValid(title)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['title'] = title
        }

        if(isValid(body)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['body'] = body
        }

        if(isValid(category)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['category'] = category
        }

        if(isPublished !== undefined) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['isPublished'] = isPublished
            updateBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }

        if(tags) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet'] = {}

            if(Array.isArray(tags)) {
                updateBlogData['$addToSet']['tags'] = { $each : [...tags] } 
            }

            if(typeof tags === 'string') {

                updateBlogData['$addToSet']['tags'] = tags
            }

        }

        if(subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet'] = {}

            if(Array.isArray(subcategory)) {
                updateBlogData['$addToSet']['subcategory'] = { $each : [...subcategory] } 
            }

            if(typeof subcategory === 'string') {

                updateBlogData['$addToSet']['subcategory'] = subcategory
            }

        }

        const updatedBlog = await blogModel.findOneAndUpdate( { _id: blogId }, updateBlogData, {new : true} )
              res.status(200).send( { status : true , message : 'Blog Updated Successfully', data : updateBlogData } )

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



////    Deleting_data     ////


const deleteById = async (req, res) => {

    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        if(!isValidobjectId(blogId)) {
            res.status(400).send( { status : false , message : `${blogId} is Not a valid Blog Id`} )
            return
        }

        if(!isValidobjectId(authorIdFromToken)) {
            res.status(400).send( { status : false , message : `${authorIdFromToken} is Not a valid token Id`} )
            return
        }

         const blog = await blogModel.findOne( { _id: blogId, isDeleted : false, deletedAt : null } )

         if(!blog) {
             res.status(404).send( {status : false , message : 'blog not found'} )
             return
         }
        
         if(blog.authorId.toString() !== authorIdFromToken) {
             res.status(401).send( { status : false , message : 'unauthorized access! Owner info Doesnt Match' } )
             return
         }
        
        await blogModel.findOneAndUpdate( {_id: blogId }, {$set : { isDeleted : true , deletedAt : new Date() }} )
        res.status(200).send( { status : false , message : "Blog Deleted Successfully" } )
        

    } catch (error) {
        res.status(500).send({ Err: error.message })
    }
}



///////     DeleteBy_QueryParams      /////

const DeleteBy_QueryParams = async (req, res) => {

    try {

       const filterQuery = {isDeleted : false , deletedAt : null }
       const queryParams = req.query
       const authorIdFromToken = req.authorId

       if(!isValidobjectId(authorIdFromToken)) {
           res.status(400).send({status: false, message:`${authorIdFromToken} is Not a valid token Id`})
           return
       }

       if(!isValidRequestBody(queryParams)) {
           res.status(400).send({status: false, message: 'No query params received , Aborting Delete Operation'})
           return
       }
       
       const {authorId, category, tags, subcategory, isPublished}= queryParams

       if(isValid(authorId && isValidobjectId(authorId))) {
           filterQuery['authorId'] = authorId
       }

       if(isValid(category)) {
           filterQuery['category'] = category.trim()
       }

       if(isValid(isPublished)) {
           filterQuery['isPublished'] = isPublished
       }

       if(isValid(tags)) {
        const tagsArr = tags.trim().split(',').map(tag => tag.trim());
        filterQuery['tags'] = {$all : tagsArr}
       }

       if(isValid(subcategory)) {
        const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim());
        filterQuery['subcategory'] = {$all : subcatArr}
       }

       
       const blogs = await blogModel.find(filterQuery)

       if( Array.isArray(blogs) && blogs.length === 0 ) {
        res.status(404).send( { status : false , message : "No Blogs Found" } )
        return
       }

       const idsOfBlogsToDelete = blogs.map(blog => {
           if(blog.authorId.toString() === authorIdFromToken) return blog._id
       })

       if(idsOfBlogsToDelete.length === 0) {
        res.status(404).send( { status : false , message : 'No Blog Found' } )
        return
       }

       await blogModel.updateMany( {_id : {$in: idsOfBlogsToDelete}} , {$set : {isDeleted : true , deletedAt : new Date()}} )
       res.status(200).send({ status: true, message: 'Blogs Deleted Successfully' } );

    } catch (error) {
        res.status(500).send({ Err: error.message })
    }
}


module.exports = { createBlog, getBlogs, updateBlogs, deleteById, DeleteBy_QueryParams }

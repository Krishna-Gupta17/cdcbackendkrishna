import { Blog } from "../models/blog.js";
import { Member } from "../models/member.js";
import { uploadToCloudinary } from "../configs/configs.js";
import { User } from "../models/user.js";

export const listMembers = async (req, res) => {
  try {
    const { year } = req.query;
    const query = year ? { memberYear: parseInt(year) } : { memberYear: 2025 };

    const members = await Member.find(query);
    return res.status(200).json({
      success: true,
      count: members.length,
      body: members,
    });
  } catch (err) {
    console.error('Error in listMembers:', err);
    return res.status(500).json({
      success: false,
      message: 'server error',
    });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { memberName, memberBio, linkedin, github } = req.body;

    const cleanMemberName = Array.isArray(memberName) ? memberName[0] : memberName;
    const cleanMemberBio = Array.isArray(memberBio) ? memberBio[0] : memberBio;
    const cleanLinkedin = Array.isArray(linkedin) ? linkedin[0] : linkedin;
    const cleanGithub = Array.isArray(github) ? github[0] : github;

    console.log('Received data:', {
      memberName: cleanMemberName,
      memberBio: cleanMemberBio,
      linkedin: cleanLinkedin,
      github: cleanGithub,
      hasFile: !!req.file
    });

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'members/avatar',
        public_id: `avatar_${member._id}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      });
      console.log('Image uploaded successfully:', uploadResult);
      member.memberImage = uploadResult.url;
    }
    member.memberName = memberName;
    member.memberBio = memberBio;
    member.memberSocial.linkedin = linkedin;
    member.memberSocial.github = github;

    member.updatedAt = new Date();

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      member,
    });

  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'count not load member',
      })
    };

    const blogs = await Blog.find({
      author: member._id,
    });

    return res.json({
      success: true,
      body: member,
      blogs: blogs
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'could not get member'
    })
  };
};

export const createBlog = async (req, res) => {

  const { title, content, description, } = req.body
  try {

    const blog = new Blog({
      title,
      content,
      description,
      author: req.params.id,
      isPublished: req.body.isPublished || false,
      publishedAt: new Date(),
    });

     const member =await  Member.findById(req.params.id)
     blog.authorName = member.memberName;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'blog/avatar',
        public_id: `avatar_${blog._id}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      });
      blog.images = uploadResult.url
      console.log('Image uploaded successfully:', uploadResult);
    }
    await blog.save();
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getMemberBlogs = async (req, res) => {
  try {
    const memberid = req.params.id;
    const userid = req.user.id;
    if (userid !== memberid) {
      const blogs = await Blog.find({ author: memberid, isPublished: true }).select('Title').sort({ publishedAt: -1 }) 
    }
    else if (userid === memberid) {
      const blogs = await Blog.find({ author: memberid }).sort({ publishedAt: -1 });
    }


    res.json({
      success: true,
      data: blogs
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


export const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'error' })
    }
    res.json({
      success: true,
      data: blog,
    });
    next();
  } catch (error) {
    res.status(500).json({ message: 'server error' });
  }
};

//update option will be inside the blog, or maybe in the card too with the button having id in it
export const updateBlog = async (req, res) => {
  const { Title, Content, IsPublished, Image, Description } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    };

    if (Title !== undefined) blog.title = Title;
    if (Content !== undefined) blog.content = Content;
    if (Description !== undefined) blog.description = Description
    if (IsPublished !== undefined) {
      blog.isPublished = IsPublished;
      if (IsPublished && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
    if (Image) {
      const imageurl = await uploadToCloudinary(Image, "Blogs")
      blog.images = imageurl
    };

    await blog.save();

    res.json({ success: true, message: 'Blog updated successfully', data: blog });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteBlog = async (req, res) => {
  try {

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    };

    await blog.remove();

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

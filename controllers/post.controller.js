import postService from '../services/post.service.js';

class PostController {
  async createPost(req, res, next) {
    try {
      const { title, description, category } = req.body;
      const { path } = req.file;
      const photo = path;
      const postBody = {
        title,
        description,
        category,
        photo,
      };
      const newPost = await postService.createPost(postBody, req.user);
      return res.status(201).json({
        status: 'success',
        data: newPost,
      });
    } catch (e) {
      next(e);
    }
  }

  async findAllPosts(req, res, next) {
    try {
      const posts = await postService.getAllPosts(req.user?._id);
      return res.status(200).json({
        status: 'success',
        posts,
      });
    } catch (e) {
      next(e);
    }
  }

  async toggleLikes(req, res, next) {
    try {
      const toggleLikesPost = await postService.toggleLikes(req.params.id, req.user._id);
      return res.status(200).json({
        status: 'success',
        post: toggleLikesPost,
      });
    } catch (e) {
      next(e);
    }
  }

  async toggleDisLikes(req, res, next) {
    try {
      const toggleDisLikesPost = await postService.toggleDisLikes(req.params.id, req.user._id);
      return res.status(200).json({
        status: 'success',
        post: toggleDisLikesPost,
      });
    } catch (e) {
      next(e);
    }
  }
  async postDetail(req, res, next) {
    try {
      const post = await postService.postDetail(req.params.id, req.user._id);
      return res.status(200).json({
        status: 'success',
        post,
      });
    } catch (e) {
      next();
    }
  }

  async deletePost(req, res, next) {
    try {
      await postService.deletePost(req.params.id, req.user);
      return res.status(200).json({
        status: 'success',
        message: 'Post deleted successfully',
      });
    } catch (e) {
      next(e);
    }
  }

  async updatePost(req, res, next) {
    try {
      const { title, description, category } = req.body;
      const { path } = req.file;
      const photo = path;
      const updatingFields = {
        title,
        description,
        category,
        photo,
      };
      const updatedPost = await postService.updatePost(req.params.id, req.user._id, updatingFields);
      return res.status(200).json({
        status: 'success',
        updatedPost,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new PostController();

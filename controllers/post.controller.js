import postService from '../services/post.service.js';

class PostController {
  async createPost(req, res, next) {
    try {
      const { title, description, category } = req.body;
      const postBody = {
        title,
        description,
        category,
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
        statuc: 'success',
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
}

export default new PostController();

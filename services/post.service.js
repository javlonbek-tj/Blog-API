import ApiError from './appError.js';
import PostModal from '../models/post.model.js';

class PostService {
  async createPost(body, user) {
    if (user.isBlocked) {
      throw new ApiError(403, 'Access denied, Your account is blocked');
    }
    const newPost = await PostModal.create({ ...body, user: user._id });
    user.posts.push(newPost);
    await user.save();
    return newPost;
  }

  async getAllPosts(userId) {
    const posts = await PostModal.find().populate('user').populate('category', 'title');
    // Check if the user is blocked by the post owner

    const filteredPosts = posts.filter(post => {
      const blockedUsers = post.user.blocked;
      const isBlocked = blockedUsers.includes(userId);
      return isBlocked ? null : post;
    });
    return filteredPosts;
  }

  async toggleLikes(postId, userId) {
    const post = await PostModal.findById(postId);
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(like => {
        return like.toString() !== userId.toString();
      });
    } else {
      post.likes.push(userId);
    }
    await post.save();
    return post;
  }

  async toggleDisLikes(postId, userId) {
    const post = await PostModal.findById(postId);
    const isDisLiked = post.dislikes.includes(userId);

    if (isDisLiked) {
      post.dislikes = post.dislikes.filter(dislike => {
        return dislike.toString() !== userId.toString();
      });
    } else {
      post.dislikes.push(userId);
    }
    await post.save();
    return post;
  }

  async postDetail(postId, userId) {
    const post = await PostModal.findById(postId);
    if (!post) {
      throw ApiError.BadRequest('Post not Found');
    }
    const isViewed = post.numViews.includes(userId);
    if (isViewed) {
      return post;
    }
    post.numViews.push(userId);
    await post.save();
    return post;
  }

  async deletePost(postId, user) {
    const post = await PostModal.findById(postId);
    if (!post) {
      throw ApiError.BadRequest('Post not Found');
    }
    if (post.user.toString() === user._id.toString() || user.role === 'Admin') {
      const deletedPost = await PostModal.findByIdAndRemove(postId);
      return deletedPost;
    } else {
      throw ApiError.UnauthorizedError();
    }
  }

  async updatePost(postId, userId, body) {
    const post = await PostModal.findById(postId);
    if (!post) {
      throw ApiError.BadRequest('Post not Found');
    }
    if (post.user.toString() !== userId.toString()) {
      throw ApiError.UnauthorizedError();
    }
    const updatedPost = await PostModal.findByIdAndUpdate(postId, body, {
      new: true,
      runValidators: true,
    });
    return updatedPost;
  }
}

export default new PostService();

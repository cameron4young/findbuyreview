import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Labeling, Posting, Saving, Sessioning } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, video: string, productURL: string, rating: number, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, video, productURL, rating, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, rating?: number, productURL?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, rating, productURL, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.post("/collection")
  async createCollection(session: SessionDoc, collectionName: string) {
    const user = Sessioning.getUser(session);
    const saved = await Saving.createCollection(user, collectionName);
    return { msg: saved.msg, collection: saved.collection };
  }

  @Router.delete("/collection")
  async deleteCollection(session: SessionDoc, collectionName: string) {
    const user = Sessioning.getUser(session);
    const collectionId = await Saving.getCollectionByName(user, collectionName);
    if (collectionId != null) {
      const saved = await Saving.deleteCollection(user, collectionId);
      return { msg: saved.msg };
    }
    return { msg: "Could not find Collection" };
  }

  @Router.get("/collection")
  async getCollections(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const collections = await Saving.getAllCollectionNames();
    return { collections: collections };
  }

  @Router.get("/collection/:collectionName")
  async getCollection(session: SessionDoc, collectionName: string) {
    const user = Sessioning.getUser(session);
    const id = await Saving.getCollectionByName(user, collectionName);
    if (id == null) {
      return { msg: "Could not find collection name" };
    }
    const posts = await Saving.getPostsInCollection(user, id);
    return { posts: posts };
  }

  @Router.post("/save")
  async savePostToCollection(session: SessionDoc, collectionName: string, id: string) {
    const user = Sessioning.getUser(session);
    const collectionId = await Saving.getCollectionByName(user, collectionName);
    const oid = new ObjectId(id);
    if (collectionId != null) {
      const saved = await Saving.savePostToCollection(user, collectionId, oid);
      return { msg: saved.msg };
    }
    return { msg: "Could not find Collection" };
  }

  @Router.delete("/save")
  async removePostFromCollection(session: SessionDoc, collectionName: string, id: string) {
    const user = Sessioning.getUser(session);
    const collectionId = await Saving.getCollectionByName(user, collectionName);
    const oid = new ObjectId(id);
    if (collectionId != null) {
      const saved = await Saving.removePostFromCollection(user, collectionId, oid);
      return { msg: saved.msg };
    }
    return { msg: "Could not find Collection" };
  }
  @Router.post("/label")
  async addLabelToPost(session: SessionDoc, postId: string, label: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(postId);
    const response = await Labeling.addLabelToPost(label, oid);
    return { msg: response.msg };
  }

  @Router.delete("/label")
  async removeLabelFromPost(session: SessionDoc, postId: string, label: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(postId);
    const response = await Labeling.removeLabelFromPost(label, oid);
    return { msg: response.msg };
  }

  @Router.get("/label/:label")
  async getPostsByLabel(session: SessionDoc, label: string) {
    const user = Sessioning.getUser(session);
    const posts = await Labeling.getPostsByLabel(label);
    return { posts };
  }

  @Router.post("/preferences/:username/interests")
  async addInterest(session: SessionDoc, username: string, interest: string) {
    // Adds an interest to the user's interests set
  }

  @Router.post("/preferences/favorite-companies")
  async addFavoriteCompany(session: SessionDoc, company: string) {
    // Adds a company to the user's favorite companies set
  }

  @Router.patch("/preferences/looking-for-status")
  async updateLookingForStatus(session: SessionDoc, lookingFor: string) {
    // Updates the user's "looking for" status
  }

  @Router.post("/preferences/location")
  async addLocation(session: SessionDoc, location: string) {
    // Adds the user's location
  }

  @Router.post("/preferences/age")
  async addAge(session: SessionDoc, age: number) {
    // Adds the user's age
  }

  @Router.post("/preferences/already-seen")
  async addAlreadySeen(session: SessionDoc, seen: string) {
    // Adds a company or product to the user's already-seen list
  }

  @Router.post("/preferences/blocked")
  async addBlocked(session: SessionDoc, block: string) {
    // Adds a company or product to the user's blocked list
  }

  @Router.get("/preferences/has-interest")
  async hasInterest(session: SessionDoc, potentialInterests: Set<string>) {
    // Returns true if any potential interests overlap with the user's interests
  }

  @Router.get("/preferences/likes-company")
  async likesCompany(session: SessionDoc, companies: Set<string>) {
    // Returns true if any companies are in the user's favorite companies set
  }

  @Router.patch("/preferences/location")
  async editLocation(session: SessionDoc, newLocation: string) {
    // Updates the user's location
  }

  @Router.get("/conversations")
  async getConversations(session: SessionDoc) {
    // Retrieves all conversations for the logged-in user
  }

  @Router.post("/conversations")
  async createConversation(session: SessionDoc, recipientId: ObjectId) {
    // Creates a new conversation between the logged-in user and the recipient
  }

  @Router.get("/conversations/:conversationId")
  async getConversation(session: SessionDoc, conversationId: ObjectId) {
    // Retrieves all messages in a specific conversation
  }

  @Router.post("/conversations/:conversationId/messages")
  async sendMessage(session: SessionDoc, conversationId: ObjectId, content: string, offer?: String) {
    // Sends a new message in the specified conversation
  }

  @Router.delete("/conversations/:conversationId/messages/:messageId")
  async deleteMessage(session: SessionDoc, conversationId: ObjectId, messageId: ObjectId) {
    // Deletes a specific message from the conversation
  }

  @Router.post("/offers")
  async sendOffer(session: SessionDoc, company: string, product: string, duration: number, recipientId: ObjectId, deal: string) {
    // Sends a new Offer (company, product, duration, deal) to the recipient
  }

  @Router.post("/promotions")
  async createPromotion(session: SessionDoc, targetId: ObjectId, interests: Set<string>, similarCompanies: Set<string>, duration: number) {
    // Promote a post or profile
  }

  @Router.get("/promotions")
  async getPromotions(session: SessionDoc) {
    // Get all promotions
  }

  @Router.patch("/promotions/:promotionId")
  async updatePromotion(session: SessionDoc, promotionId: ObjectId, interests?: Set<string>, similarCompanies?: Set<string>, duration?: number) {
    // Update promotion details
  }

  @Router.delete("/promotions/:promotionId")
  async deletePromotion(session: SessionDoc, promotionId: ObjectId) {
    // Cancel a promotion
  }

  @Router.get("/promotions/:promotionId/check-expiration")
  async checkPromotionExpiration(session: SessionDoc, promotionId: ObjectId) {
    // Check if promotion is expired
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);

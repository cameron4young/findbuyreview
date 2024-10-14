import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Labeling, Messages, Posting, Preferences, Saving, Sessioning } from "./app";
import { Offer } from "./concepts/messages";
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
    return { posts: posts };
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
    const collections = await Saving.getAllCollectionNames();
    return { collections: collections };
  }
  @Router.get("/collections/user/:userId")
  async getCollectionsByUser(session: SessionDoc, userId: string) {
    const userObjectId = new ObjectId(userId);
    const collections = await Saving.getCollectionsByUser(userObjectId);
    return { msg: "Collections fetched successfully", collections };
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
    const oid = new ObjectId(postId);
    const response = await Labeling.addLabelToPost(label, oid);
    return { msg: response.msg };
  }

  @Router.delete("/label")
  async removeLabelFromPost(session: SessionDoc, postId: string, label: string) {
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

  @Router.post("/preferences")
  async createUserProfile(userId: ObjectId, interests: string, age: number, location: string, lookingFor: string, favoriteCompanies: string, doNotShow: string) {
    const interestsArray = interests ? interests.split(",").map((item) => item.trim()) : [];
    const favoriteCompaniesArray = favoriteCompanies ? favoriteCompanies.split(",").map((item) => item.trim()) : [];
    const doNotShowArray = doNotShow ? doNotShow.split(",").map((item) => item.trim()) : [];

    const profile = await Preferences.createUserPreferenceDoc(userId, interestsArray, age, location, lookingFor, favoriteCompaniesArray, doNotShowArray);
    return { msg: profile };
  }

  @Router.post("/preferences/:userId/interests")
  async addInterest(session: SessionDoc, userId: ObjectId, interest: string) {
    await Preferences.addInterest(userId, interest);
    return { msg: `Interest ${interest} added for user ${userId}` };
  }

  @Router.post("/preferences/:userId/favorite-companies")
  async addFavoriteCompany(session: SessionDoc, userId: ObjectId, company: string) {
    await Preferences.addFavoriteCompany(userId, company);
    return { msg: `Favorite company ${company} added for user ${userId}` };
  }

  @Router.post("/preferences/:userId/blocked")
  async blockContent(session: SessionDoc, userId: ObjectId, block: string) {
    await Preferences.blockContent(userId, block);
    return { msg: `Content ${block} blocked for user ${userId}` };
  }

  @Router.patch("/preferences/:userId/location")
  async updateLocation(session: SessionDoc, userId: ObjectId, newLocation: string) {
    await Preferences.updateLocation(userId, newLocation);
    return { msg: `Location updated to ${newLocation} for user ${userId}` };
  }

  @Router.patch("/preferences/:userId/age")
  async updateAge(session: SessionDoc, userId: ObjectId, newAge: number) {
    await Preferences.updateAge(userId, newAge);
    return { msg: `Age updated to ${newAge} for user ${userId}` };
  }

  @Router.patch("/preferences/:userId/looking-for")
  async updateLookingFor(session: SessionDoc, userId: ObjectId, newLookingFor: string) {
    await Preferences.updateLookingFor(userId, newLookingFor);
    return { msg: `Looking-for status updated to ${newLookingFor} for user ${userId}` };
  }

  @Router.get("/preferences/:userId")
  async getPreferences(session: SessionDoc, userId: ObjectId) {
    const preferences = await Preferences.getPreferences(userId);
    return { preferences };
  }

  @Router.post("/conversations")
  async createConversation(session: SessionDoc, recipientId: string) {
    const senderId = Sessioning.getUser(session);
    const response = await Messages.createConversation(senderId, new ObjectId(recipientId));
    return { msg: response.msg, conversationId: response.conversationId };
  }

  @Router.get("/conversations")
  async getConversationBySenderAndRecipient(session: SessionDoc, recipientId: string) {
    const senderId = Sessioning.getUser(session);
    const conversation = await Messages.getConversationBySenderAndRecipient(senderId, new ObjectId(recipientId));
    return { conversation };
  }

  @Router.get("/conversations/:conversationId/messages")
  async getMessages(session: SessionDoc, conversationId: string) {
    const messages = await Messages.getMessages(new ObjectId(conversationId));
    return { messages };
  }

  @Router.post("/conversations/:conversationId/messages")
  async sendMessage(session: SessionDoc, conversationId: string, content: string, offer: Offer) {
    const response = await Messages.sendMessage(new ObjectId(conversationId), content, offer);
    return { msg: response.msg, messageId: response.messageId };
  }

  @Router.post("/conversations/:conversationId/messages/:messageId/response")
  async addResponseToOffer(session: SessionDoc, conversationId: string, messageId: string, postId: string, response: string) {
    const resp = await Messages.addResponseToOffer(new ObjectId(conversationId), new ObjectId(messageId), new ObjectId(postId), response);
    return { msg: resp.msg };
  }

  @Router.post("/conversations/:conversationId/messages/:messageId/approve")
  async approveOffer(session: SessionDoc, conversationId: string, messageId: string) {
    const senderId = Sessioning.getUser(session);
    const resp = await Messages.approveOffer(new ObjectId(conversationId), new ObjectId(messageId), senderId);
    return { msg: resp.msg };
  }

  @Router.delete("/conversations/:conversationId/messages/:messageId")
  async deleteMessage(session: SessionDoc, conversationId: string, messageId: string) {
    const response = await Messages.deleteMessage(new ObjectId(conversationId), new ObjectId(messageId));
    return { msg: response.msg };
  }

  @Router.post("/promotions")
  async createPromotion(session: SessionDoc, postId: string, duration: number) {
    const oid = new ObjectId(postId);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + duration);
    const response = await Labeling.addLabelToPost("promoted", oid, expirationDate);
    return { msg: response.msg };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);

import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface Offer {
  company: string;
  product: string;
  duration: number;
  createdAt: Date;
  response?: string;
  associatedPost?: ObjectId;
  approved?: boolean;
}

export interface MessageDoc extends BaseDoc {
  _id: ObjectId;
  content: string;
  offer?: Offer;
}

export interface ConversationDoc extends BaseDoc {
  _id: ObjectId;
  sender: ObjectId;
  recipient: ObjectId;
  messages: MessageDoc[]; // Store messages directly as objects
}

export default class MessagesConcept {
  public readonly conversations: DocCollection<ConversationDoc>;

  constructor(collectionName: string) {
    this.conversations = new DocCollection<ConversationDoc>(collectionName);
  }

  // Create a conversation with an empty messages array
  async createConversation(sender: ObjectId, recipient: ObjectId) {
    const _id = await this.conversations.createOne({
      sender,
      recipient,
      messages: [], // Initialize as empty array
    });
    return { msg: "Conversation created!", conversationId: _id };
  }

  // Get a conversation by sender and recipient
  async getConversationBySenderAndRecipient(senderId: ObjectId, recipientId: ObjectId) {
    const conversation = await this.conversations.readOne({
      sender: senderId,
      recipient: recipientId,
    });

    if (!conversation) {
      throw new Error("Conversation between sender and recipient not found.");
    }

    return conversation;
  }

  // Send a message and add it directly as an object in the conversation
  async sendMessage(conversationId: ObjectId, content: string, offer?: Offer) {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const messageId = new ObjectId();
    const now = new Date();

    const message: MessageDoc = {
      _id: messageId,
      dateCreated: now,
      dateUpdated: now,
      content,
      offer: offer ? { ...offer, createdAt: now, approved: false } : undefined,
    };

    // Add the message to the conversation
    conversation.messages.push(message);
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Message sent!", messageId };
  }

  // Add response to offer and link associated post
  async addResponseToOffer(conversationId: ObjectId, messageId: ObjectId, postId: ObjectId, response: string) {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message = conversation.messages.find((m) => m._id.toString() === messageId.toString());
    if (!message?.offer) {
      throw new Error("No offer associated with this message.");
    }

    // Add response and link associated post
    message.offer.response = response;
    message.offer.associatedPost = postId;

    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Response added and post linked to offer." };
  }

  // Approve the offer by the original sender
  async approveOffer(conversationId: ObjectId, messageId: ObjectId, senderId: ObjectId) {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message = conversation.messages.find((m) => m._id.toString() === messageId.toString());
    if (!message?.offer) {
      throw new Error("No offer associated with this message.");
    }

    if (conversation.sender.toString() !== senderId.toString()) {
      throw new Error("Only the original sender can approve the offer.");
    }

    if (message.offer.associatedPost) {
      message.offer.approved = true;
      await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });
      return { msg: "Offer approved!" };
    } else {
      return { msg: "Offer cannot be approved, no associated post found." };
    }
  }

  // Get all messages in a conversation
  async getMessages(conversationId: ObjectId) {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return conversation.messages; // Return messages directly
  }

  // Delete a message from a conversation
  async deleteMessage(conversationId: ObjectId, messageId: ObjectId) {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Remove the message from the conversation
    conversation.messages = conversation.messages.filter((m) => m._id.toString() !== messageId.toString());
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Message deleted!" };
  }

  // Helper function to check if the offer is expired
  isOfferExpired(offer: Offer): boolean {
    const now = new Date();
    const expirationDate = new Date(offer.createdAt);
    expirationDate.setDate(expirationDate.getDate() + offer.duration);
    return now > expirationDate;
  }
}

import { create } from "zustand";
import { account, databases } from "./appwrite";
import { Query } from "appwrite";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { ID } from "appwrite";

const useStore = create((set, get) => ({
  initialState: {
    databaseId: import.meta.env.VITE_APP_DATABASE_ID,
    collectionId: import.meta.env.VITE_APP_COLLECTION_ID,
    projectId: import.meta.env.VITE_APP_PROJECT_ID,
  },

  pageInfo: {
    content: "",
    author: (() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    })(),
    keywords: [],
    link: "",
    userLink: null,
    visibility: true,
    expiry: (() => {
      let currentDate = new Date();
      let oneYearLater = new Date(currentDate);
      oneYearLater.setFullYear(currentDate.getFullYear() + 1);
      return oneYearLater.toISOString().slice(0, 10);
    })(),
    onceRead: false,
    viewCount: 0,
    likes: 0,
    dislikes: 0,
    password: null,
  },

  editLink: null,
  publishStatus: false,
  showModal: true,
  user: null,

  setPageInfo: (name, data) => {
    const { pageInfo } = get();
    set({ pageInfo: { ...pageInfo, [name]: data } });
  },

  setPublishStatus: (data) => {
    const { pageInfo } = get();
    set({ publishStatus: data });
    if (!pageInfo.link) {
      get().generateRandomUrl();
    }
  },

  generateRandomUrl: async () => {
    const {
      setPageInfo,
      pageInfo,
      setPageInfoToDB,
      setPublishStatus,
      getSameLink,
    } = get();

    if (!pageInfo.link) {
      let linkGen = Math.random().toString(36).substring(2, 7);
      while (await getSameLink(linkGen)) {
        linkGen = Math.random().toString(36).substring(2, 7);
      }
      setPageInfo("link", linkGen);
    }

    setPublishStatus(true);
  },

  getSameLink: async (link) => {
    const { collectionId, databaseId } = get().initialState;

    try {
      const res = await databases.listDocuments(databaseId, collectionId);
      return res.documents.some(doc => doc.link === link);
    } catch (error) {
      console.error('Error in getSameLink:', error);
      return false;
    }
  },

  setPageInfoToDB: async (setLocalValue) => {
    const { user } = get();
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return false;
    }

    const {
      content,
      author,
      visibility,
      expiry,
      password,
      link,
      onceRead,
      likes,
      dislikes,
      viewCount,
      userLink,
      keywords,
    } = get().pageInfo;
    const { databaseId, collectionId, pageInfo } = get().initialState;

    console.log('Database ID:', databaseId);
    console.log('Collection ID:', collectionId);

    try {
      if (!content) {
        toast.error("Content cannot be empty");
        return false;
      }

      if (!author) {
        toast.error("Author name cannot be empty");
        return false;
      }

      const existingDocs = await databases.listDocuments(databaseId, collectionId);
      if (existingDocs.documents.some(doc => doc.link === link)) {
        toast.error("Link Already Exists");
        return false;
      }

      try {
        const newDocument = {
          content,
          author,
          visibility,
          expiry,
          password,
          link,
          onceRead,
          likes,
          dislikes,
          viewCount,
          userLink,
          keywords,
        };

        console.log('Attempting to create document:', newDocument);
        const res = await databases.createDocument(
          databaseId,
          collectionId,
          ID.unique(),
          newDocument
        );
        console.log('Document created:', res);
        toast.success("Page Published successfully");
        setLocalValue((prev) => [...prev, res.$id]);
        set({ editLink: res.$id });
        return true;
      } catch (err) {
        console.error('Error creating document:', err);
        toast.error(`Error creating document: ${err.message}`);
        return false;
      }
    } catch (err) {
      console.error('Error in setPageInfoToDB:', err);
      toast.error(`Error: ${err.message}`);
      return false;
    }
  },

  deleteDocument: async () => {
    const { databaseId, collectionId } = get().initialState;
    try {
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString();

      const res = await databases.listDocuments(databaseId, collectionId, [
        Query.lessThan("expiry", formattedCurrentDate),
      ]);

      res.documents.forEach(async (doc) => {
        if (doc.expiry && doc.expiry !== "") {
          await databases.deleteDocument(databaseId, collectionId, doc.$id);
        }
      });
    } catch (error) {
      console.log("deleting error", error);
    }
  },

  getPageBasedOnLink: async (link) => {
    const { databaseId, collectionId } = get().initialState;
    console.log("Fetching document for link:", link);
    try {
      const response = await databases.listDocuments(databaseId, collectionId);
      console.log("Database response:", response);
      const document = response.documents.find(doc => doc.link === link);
      if (document) {
        console.log("Document found:", document);
        set({ pageInfo: document });
      } else {
        console.log("No document found with the given link");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  },

  RenderPageOnLink: async (editValue) => {
    const { databaseId, collectionId } = get().initialState;
    if (editValue) {
      try {
        const res = await databases.listDocuments(databaseId, collectionId, [
          Query.equal("$id", editValue),
        ]);
        set({ pageInfo: res.documents[0] });
      } catch (err) {
        console.log(err);
      }
    }
  },

  updatePageInfo: async (editLink, localValue) => {
    const { databaseId, collectionId } = get().initialState;
    const { pageInfo } = get();
    const verify = localValue.find((item) => item === editLink);
    if (!verify) {
      return toast.error("Unauthorized Access");
    }
    try {
      if (!pageInfo.content) {
        toast.error("Content cannot be empty");
        return false;
      }
      if (!pageInfo.author) {
        toast.error("Author name cannot be empty");
        return false;
      }
      const res = await databases.updateDocument(
        databaseId,
        collectionId,
        editLink,
        {
          content: pageInfo.content,
          author: pageInfo.author,
          visibility: pageInfo.visibility,
          expiry: pageInfo.expiry,
          password: pageInfo.password,
          link: pageInfo.link,
          onceRead: pageInfo.onceRead,
          likes: pageInfo.likes,
          dislikes: pageInfo.dislikes,
          viewCount: pageInfo.viewCount,
          userLink: pageInfo.userLink,
          keywords: pageInfo.keywords,
        }
      );
      if (res) {
        toast.success("Page Updated successfully");
        return true;
      }
    } catch (err) {
      console.error('Error updating document:', err);
      toast.error(`Error updating document: ${err.message}`);
      return false;
    }
    return false;
  },

  totalPageViews: async () => {
    const { databaseId, collectionId } = get().initialState;
    const { pageInfo, usersAccess } = get();
    try {
      const res = await databases.updateDocument(
        databaseId,
        collectionId,
        pageInfo.$id,
        {
          viewCount: pageInfo.viewCount + 1,
        }
      );
      usersAccess();
    } catch (error) {
      console.log(error);
    }
  },

  deletePage: async (id) => {
    const { databaseId, collectionId } = get().initialState;
    try {
      const res = await databases.deleteDocument(databaseId, collectionId, id);
    } catch (error) {
      console.log(error);
    }
  },

  totalLikes: async () => {
    const { databaseId, collectionId } = get().initialState;
    const { pageInfo, user } = get();
    try {
      const res = await databases.updateDocument(
        databaseId,
        collectionId,
        pageInfo.$id,
        {
          likes: pageInfo.likes + 1,
        }
      );
      if (res) {
        set((state) => ({
          pageInfo: {
            ...state.pageInfo,
            likes: state.pageInfo.likes + 1,
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },

  usersAccess: async () => {
    const { pageInfo, deletePage } = get();
    if (pageInfo.onceRead && pageInfo.viewCount >= 1) {
      deletePage(pageInfo && pageInfo.$id);
      return toast.error("Maximum Page Limit reached");
    }
  },

  totalDislikes: async () => {
    const { databaseId, collectionId } = get().initialState;
    const { pageInfo, user } = get();
    try {
      const res = await databases.updateDocument(
        databaseId,
        collectionId,
        pageInfo.$id,
        {
          dislikes: pageInfo.dislikes + 1,
        }
      );
      if (res) {
        set((state) => ({
          pageInfo: {
            ...state.pageInfo,
            dislikes: state.pageInfo.dislikes + 1,
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },

  initializeAuthor: () => {
    const storedAuthor = localStorage.getItem("dopaste_author");
    if (storedAuthor) {
      set((state) => ({
        pageInfo: { ...state.pageInfo, author: storedAuthor },
        showModal: false,
      }));
    }
  },

  setAuthor: (name) => {
    set((state) => ({
      pageInfo: { ...state.pageInfo, author: name },
      showModal: false,
    }));
  },

  saveDocument: async () => {
    const { pageInfo, initialState } = get();
    const { databaseId, collectionId } = initialState;

    try {
      // Check if required fields are present
      if (!pageInfo.content) {
        throw new Error("Content cannot be empty");
      }
      if (!pageInfo.author) {
        throw new Error("Author name cannot be empty");
      }

      // Generate a unique link if not present
      if (!pageInfo.link) {
        pageInfo.link = await get().generateRandomUrl();
      }

      const documentData = {
        content: pageInfo.content,
        author: pageInfo.author,
        keywords: pageInfo.keywords,
        link: pageInfo.link,
        userLink: pageInfo.userLink,
        visibility: pageInfo.visibility,
        expiry: pageInfo.expiry,
        onceRead: pageInfo.onceRead,
        viewCount: pageInfo.viewCount,
        likes: pageInfo.likes,
        dislikes: pageInfo.dislikes,
        password: pageInfo.password,
        createdAt: new Date().toISOString(),
      };

      console.log('Document data to be saved:', JSON.stringify(documentData, null, 2));

      console.log('Attempting to save document:', documentData);
      console.log('Database ID:', databaseId);
      console.log('Collection ID:', collectionId);

      const response = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        documentData
      );

      console.log('Document saved successfully:', response);
      set({ publishStatus: true, editLink: response.$id });
      toast.success("Document saved successfully!");
      return response;
    } catch (error) {
      console.error("Error saving document:", error);
      if (error.code === 401) {
        toast.error("Authentication error. Please ensure you have the correct permissions.");
      } else {
        toast.error(`Failed to save document: ${error.message}`);
      }
      return null;
    }
  },

  fetchDocument: async (id) => {
    const { initialState } = get();
    const { databaseId, collectionId } = initialState;

    try {
      const document = await databases.getDocument(databaseId, collectionId, id);
      return document;
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to fetch document. Please try again.");
      return null;
    }
  },

  login: async (email, password) => {
    console.log('Attempting login with email:', email);
    try {
      const session = await account.createEmailSession(email, password);
      console.log('Session created:', session);
      const user = await account.get();
      console.log('User fetched:', user);
      set({ user });
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await account.deleteSession('current');
      set({ user: null });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const user = await account.get();
      set({ user });
      return user;
    } catch {
      set({ user: null });
      return null;
    }
  },

  register: async (email, password) => {
    try {
      const response = await account.create(ID.unique(), email, password);
      const session = await account.createEmailSession(email, password);
      const user = await account.get();
      set({ user });
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

}));

export default useStore;

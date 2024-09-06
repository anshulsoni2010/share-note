import { create } from "zustand";
import { account, databases } from "./appwrite";
import { Query } from "appwrite";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";

const useStore = create((set, get) => ({
  initialState: {
    databaseId: process.env.VITE_APP_DATABASE_ID,
    collectionId: process.env.VITE_APP_COLLECTION_ID,
    projectId: process.env.VITE_APP_PROJECT_ID,
  },

  pageInfo: {
    title: null,
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
      const res = await databases.getDocuments(databaseId, collectionId, [
        Query.equal("link", link),
      ]);
      return res.documents.length > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  setPageInfoToDB: async (setLocalValue) => {
    const {
      title,
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

    try {
      if (!title) {
        toast.error("Title cannot be empty");
        return;
      }

      if(!content){
        toast.error("content cannot be empty");
        return;
      }

      if (!author) {
        toast.error("author name cannot be empty");
        return;
      }

      const res = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("link", link),
      ]);

      if (res.documents.length > 0) {
        toast.error("Link Already Exists");
        return;
      }

      try {
        const newDocument = {
          title,
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

        const res = await databases.createDocument(
          databaseId,
          collectionId,
          "unique()",
          newDocument
        );
        toast.success("Page Published successfully");
        setLocalValue((prev) => [...prev, res.$id]);
        return set({ editLink: res.$id });
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
    } catch (err) {
      console.error(err.message);
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
    try {
      const res = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("link", link),
      ]);
      set({ pageInfo: res.documents[0] });
    } catch (err) {
      console.log(err.message);
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
      if (!pageInfo.title) {
        toast.error("Title cannot be empty");
        return;
      }
       if (!pageInfo.content) {
        toast.error("content cannot be empty");
        return;
      }
      if (!pageInfo.author) {
        toast.error("author name cannot be empty");
        return;
      }
      const res = await databases.updateDocument(
        databaseId,
        collectionId,
        editLink,
        {
          title: pageInfo.title,
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
      }
    } catch (err) {
      console.log(err);
    }
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
}));

export default useStore;

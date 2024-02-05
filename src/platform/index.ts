import { randomUUID } from "crypto";
import {
  MessageDBInsert,
  ThreadDBInsert,
  PaginatedWithCursors,
  ThreadWithMessagesAndParticipants,
  UserID,
  Thread,
  Message,
  ThreadType,
  PaginationArg,
  ThreadID,
  Paginated,
  ThreadFolderName,
  User,
  MessageContent,
  MessageSendOptions,
  CurrentUser,
  LoginCreds,
  SerializedSession,
  ExtraProp,
  ServerEvent,
  ServerEventType,
} from "../lib/types";
import { messages, threads } from "../db/schema";
import { db } from "../db";
import {
  selectMessages,
  selectThread,
  selectThreads,
  selectUsers,
} from "../db/repo";
import {
  extraMap,
  mapDbMessageToTextsMessage,
  mapDbThreadToTextsThread,
  mapDbUserToTextsUser,
} from "../lib/helpers";
import { sendEvent } from "../lib/ws";

/*
    Creates a thread and returns the created thread
*/
export async function createThread(
  userIDs: UserID[],
  currentUserID: UserID,
  title?: string,
  messageText?: string
): Promise<Thread> {
  const userId = userIDs[0];

  // You can use currentUserID to get the extra data you may need to create a thread
  const extra = extraMap.get(currentUserID);
  if (!extra) {
    throw new Error(`No extra found for user ${currentUserID}`);
  }

  const type: ThreadType = "single";

  const threadCommon = {
    id: randomUUID(),
    type,
    timestamp: new Date(),
    title: title || undefined,
    isUnread: false,
    isReadOnly: false,
  };

  const dbThread: ThreadDBInsert = {
    ...threadCommon,
  };

  await db.insert(threads).values(dbThread);

  const messages: Message[] = [];

  const thread: Thread = {
    ...threadCommon,
    messages: {
      items: messages,
      hasMore: false,
    },
    participants: {
      hasMore: false,
      items: [
        {
          id: userId,
        },
      ],
    },
    isUnread: false,
    isReadOnly: false,
  };

  return thread;
}

/* 
    Gets all messages for a threadID
*/
export async function getMessages(
  threadID: string,
  currentUserID: UserID,
  pagination?: PaginationArg
): Promise<Paginated<Message>> {
  const dbMessages = await selectMessages(threadID);

  if (!dbMessages) {
    return { items: [], hasMore: false };
  }

  const messages = dbMessages.map((message) => {
    const textsData = mapDbMessageToTextsMessage(message);
    return textsData;
  });

  return {
    items: messages,
    hasMore: false,
  };
}

/* 
    Gets a thread by threadID
*/
export async function getThread(
  threadID: ThreadID,
  currentUserID: UserID
): Promise<Thread> {
  const dbThread = await selectThread(threadID, currentUserID);
  const thread = mapDbThreadToTextsThread(dbThread);
  return thread;
}

/* 
    Get all threads
*/
export async function getThreads(
  inboxName: ThreadFolderName,
  currentUserID: UserID,
  pagination?: PaginationArg
): Promise<PaginatedWithCursors<Thread>> {
  const dbThreads = await selectThreads(currentUserID);

  if (!dbThreads) {
    return {
      items: [],
      hasMore: false,
      oldestCursor: "0",
    };
  }

  const threads = dbThreads.map(
    (threadData: ThreadWithMessagesAndParticipants) => {
      const textsData = mapDbThreadToTextsThread(threadData);
      return textsData;
    }
  );

  return {
    items: threads,
    hasMore: false,
    oldestCursor: "0",
  };
}

/* 
    Returns a list of users available
*/
export async function searchUsers(currentUserID: UserID): Promise<User[]> {
  const dbUsers = await selectUsers(currentUserID);

  if (!dbUsers) {
    return [];
  }

  const allUsers = dbUsers.map((user) => {
    const textsData = mapDbUserToTextsUser(user);
    return textsData;
  });

  return allUsers;
}

/* 
    Produces a response message.
    Create both the userMessage and the responseMessage and insert them into the database. Make sure to flag isSender as true for the userMessage and false for the responseMessage.
    Send a STATE_SYNC event to the client with the responseMessage to update the client state.
*/
export async function sendMessage(
  userMessage: Message,
  threadID: ThreadID,
  content: MessageContent,
  currentUserID: UserID,
  options?: MessageSendOptions
): Promise<Message> {
  const dbUserMessage: MessageDBInsert = {
    ...userMessage,
    timestamp: new Date(userMessage.timestamp),
    seen: true,
    isSender: true,
    isDelivered: true,
    senderID: currentUserID,
    threadID,
  };

  const responseMessage: Message = {
    id: randomUUID(),
    timestamp: new Date(),
    text: `Response`,
    senderID: "2",
    isSender: false,
    threadID,
  };

  const dbResponseMessage: MessageDBInsert = {
    ...responseMessage,
    seen: false,
  };

  await db.insert(messages).values([dbUserMessage, dbResponseMessage]);

  const event: ServerEvent = {
    type: ServerEventType.STATE_SYNC,
    objectName: "message",
    mutationType: "upsert",
    objectIDs: { threadID },
    entries: [responseMessage],
  };

  sendEvent(event, currentUserID);

  return responseMessage;
}

/* 
    Gets the loginCreds, adds the extra fields to a map of <userId,extra> and returns the currentUser
*/
export function login(
  creds: LoginCreds,
  userID: string
): CurrentUser | undefined {
  if ("custom" in creds) {
    const displayText = creds.custom.label;
    const currentUser: CurrentUser = {
      id: userID,
      username: "test",
      displayText,
    };

    const extra = creds.custom;
    delete extra.baseURL;

    extraMap.set(userID, extra);

    return currentUser;
  } else {
    return undefined;
  }
}

/* 
    Reinitializes the user with the serialized session data
*/
export function initUser(session: SerializedSession) {
  const currentUser: CurrentUser = session.currentUser;
  const extra: ExtraProp = session.extra;
  const userID = currentUser.id;

  const currentExtra = extraMap.get(userID);

  if (!currentExtra) {
    extraMap.set(userID, extra);
  } else {
    console.log(`No user found with ID ${userID}`);
  }
}

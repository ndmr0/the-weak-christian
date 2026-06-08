import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import encouragements from "./src/data/encouragements.json";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true
    })
  });
}

const STORAGE_KEYS = {
  favoriteSavedIds: "twc.favoriteSavedIds",
  hasOnboarded: "twc.hasOnboarded",
  journalEntries: "twc.journalEntries",
  moodEntries: "twc.moodEntries",
  name: "twc.name",
  notificationHour: "twc.notificationHour",
  prayerRequests: "twc.prayerRequests",
  savedIds: "twc.savedIds",
  savedNotes: "twc.savedNotes",
  seenHistory: "twc.seenHistory",
  seenIds: "twc.seenIds"
};

const SPLASH_MS = 1200;
const TODAY_MESSAGE_MAX_CHARS = 360;
const TODAY_VERSE_MAX_CHARS = 190;
const MOOD_HEATMAP_DAYS = 182;
const MOOD_HEATMAP_ROWS = 7;
const APP_NAME = "Daily Notes of Grace";
const APP_MARKETING_URL = "https://ndmr0.github.io/the-weak-christian/";
const APP_INVITE_MESSAGE = `I thought you might appreciate ${APP_NAME}, a quiet app for daily Scripture encouragement.\n\n${APP_MARKETING_URL}`;
const DEFAULT_NOTIFICATION_HOUR = 7;
const REMINDER_HOURS = [7, 8, 9];
const SERIF_FONT = Platform.select({ ios: "Georgia", web: "Georgia", default: "serif" });
const TODAY_CARD_BACKGROUND = require("./assets/today-encouragement-bg.jpg");

const TOKENS = {
  fontFamily: {
    medium: Platform.OS === "ios" ? "System" : "Roboto",
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    serif: SERIF_FONT
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 34
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
    black: "900"
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.7
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.6
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    "2xl": 24,
    full: 9999
  },
  colors: {
    accent: "#4F46E5",
    accentBorder: "rgba(79,70,229,0.18)",
    accentBorderStrong: "rgba(79,70,229,0.28)",
    accentBorderSubtle: "rgba(79,70,229,0.10)",
    accentFg: "#FFFFFF",
    accentHover: "#4338CA",
    accentLight: "#EEF2FF",
    accentPressed: "#E0E7FF",
    accentSurface: "#EEF2FF",
    accentWash: "rgba(79,70,229,0.12)",
    background: "#F8F8FA",
    border: "#E5E5EA",
    borderSubtle: "rgba(10,10,11,0.06)",
    danger: "#DC2626",
    dangerBorder: "#FECACA",
    dangerLight: "#FEE2E2",
    info: "#0284C7",
    infoLight: "#E0F2FE",
    inputSelection: "#C8C3F6",
    muted: "#F2F2F7",
    mutedBorder: "#E5E5EA",
    placeholder: "#8D899B",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    surfaceWarm: "#FFFFFF",
    success: "#16A34A",
    successLight: "#DCFCE7",
    text: "#0A0A0B",
    textInverse: "#FFFFFF",
    textStrongSecondary: "#3F3F46",
    textSecondary: "#706A7D",
    textTertiary: "#AEAEB2",
    warning: "#D97706",
    warningLight: "#FEF3C7"
  },
  shadows: {
    xs: {
      elevation: 1,
      shadowColor: "#000000",
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.04,
      shadowRadius: 2
    },
    sm: {
      elevation: 2,
      shadowColor: "#000000",
      shadowOffset: { height: 2, width: 0 },
      shadowOpacity: 0.06,
      shadowRadius: 4
    },
    md: {
      elevation: 4,
      shadowColor: "#000000",
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 8
    },
    lg: {
      elevation: 8,
      shadowColor: "#000000",
      shadowOffset: { height: 8, width: 0 },
      shadowOpacity: 0.10,
      shadowRadius: 16
    },
    xl: {
      elevation: 12,
      shadowColor: "#000000",
      shadowOffset: { height: 16, width: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 24
    }
  }
};

const APP_PURPLE_BG = TOKENS.colors.background;
const APP_PURPLE_DEEP = TOKENS.colors.text;
const APP_PURPLE_SOFT = TOKENS.colors.accentLight;
const APP_PURPLE_TEXT = TOKENS.colors.text;
const APP_PURPLE_MUTED = TOKENS.colors.textSecondary;
const APP_WARM_CARD = TOKENS.colors.surfaceWarm;
const APP_WARM_ACCENT = TOKENS.colors.accentLight;
const APP_ACCENT = TOKENS.colors.accent;
const APP_ACCENT_HOVER = TOKENS.colors.accentHover;
const APP_BORDER = TOKENS.colors.border;
const APP_BORDER_SOFT = TOKENS.colors.borderSubtle;
const APP_SURFACE = TOKENS.colors.surface;
const APP_SURFACE_WARM = TOKENS.colors.surfaceWarm;

function hexToRgb(hexColor) {
  const normalized = hexColor.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    blue: value & 255,
    green: (value >> 8) & 255,
    red: (value >> 16) & 255
  };
}

function softShadow({ blur, color = TOKENS.colors.text, opacity, x = 0, y }) {
  if (Platform.OS === "web") {
    const { blue, green, red } = hexToRgb(color);
    return {
      boxShadow: `${x}px ${y}px ${blur}px rgba(${red}, ${green}, ${blue}, ${opacity})`
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { height: y, width: x },
    shadowOpacity: opacity,
    shadowRadius: blur
  };
}

const HOME_SECTIONS = [
  { key: "today", title: "Today", detail: "Open today's encouragement." },
  { key: "explore", title: "Explore", detail: "Browse themes and search Scripture." },
  { key: "saved", title: "My Notes", detail: "Saved notes and reflections." },
  { key: "journal", title: "Journal", detail: "Reflect on what you read." },
  { key: "prayer", title: "Prayer", detail: "Keep requests before the Lord." },
  { key: "settings", title: "Profile", detail: "Name, privacy, and controls." }
];

const EXPLORE_FILTERS = [
  { label: "Peace" },
  { label: "Anxiety", keywords: ["anxious", "anxiety", "worry", "worried", "fear", "afraid", "troubled"] },
  { label: "Strength" },
  { label: "Grace" },
  { label: "Prayer" },
  { label: "Hope" },
  { label: "Wisdom" },
  { label: "Faith" },
  { label: "God's Presence" },
  { label: "Love" },
  { label: "Joy" },
  { label: "Salvation" }
];

const JOURNAL_PROMPTS = [
  {
    label: "Gratitude",
    title: "Gratitude",
    body: "Today I can thank God for..."
  },
  {
    label: "What I Read",
    title: "What I Read",
    body: "The verse or encouragement that stood out to me was..."
  },
  {
    label: "What I Need",
    title: "What I Need",
    body: "Lord, today my heart needs..."
  },
  {
    label: "Obedience",
    title: "Obedience",
    body: "One step of faith I can take today is..."
  },
  {
    label: "Hope",
    title: "Hope",
    body: "The promise I want to remember today is..."
  }
];

const PRAYER_CATEGORIES = [
  "Personal",
  "Family",
  "Healing",
  "Provision",
  "Wisdom",
  "Church",
  "Salvation",
  "Gratitude"
];

const PRAYER_PROMPTS = [
  {
    label: "For Today",
    title: "For Today",
    body: "Lord, help me walk through today with..."
  },
  {
    label: "For Someone",
    title: "For Someone",
    body: "Lord, I bring this person before You..."
  },
  {
    label: "Waiting",
    title: "While I Wait",
    body: "Lord, while I wait, help me trust You with..."
  },
  {
    label: "Answered",
    title: "Answered Prayer",
    body: "Lord, thank You for answering..."
  }
];

const SOCIAL_MOOD_OPTIONS = [
  { emoji: "😶", label: "Isolated" },
  { emoji: "😐", label: "Withdrawn" },
  { emoji: "🙂", label: "Sociable" }
];

const SLEEP_OPTIONS = [
  { emoji: "🌙", label: "Poor" },
  { emoji: "🌙", label: "Okay" },
  { emoji: "🌙✨", label: "Good" }
];

const MOOD_OPTIONS = [
  {
    emoji: "😔",
    keywords: ["discouraged", "weary", "endure", "promise", "hope", "standing"],
    label: "Discouraged",
    themes: ["Hope", "Perseverance", "Comfort", "Renewal"]
  },
  {
    emoji: "😴",
    keywords: ["weary", "rest", "weakness", "strength", "tired"],
    label: "Tired",
    themes: ["Strength", "Comfort", "Peace", "Renewal"]
  },
  {
    emoji: "😟",
    keywords: ["anxious", "fear", "worry", "care", "peace", "trust"],
    label: "Anxious",
    themes: ["Peace", "Faith", "God's Presence", "Guidance"]
  },
  {
    emoji: "😮",
    keywords: ["alone", "lonely", "presence", "known", "near"],
    label: "Lonely",
    themes: ["God's Presence", "Love", "Comfort", "Identity in Christ"]
  },
  {
    emoji: "🤔",
    keywords: ["wisdom", "guidance", "confused", "path", "lead"],
    label: "Confused",
    themes: ["Wisdom", "Guidance", "Faith", "Prayer"]
  },
  {
    emoji: "😨",
    keywords: ["afraid", "fear", "refuge", "protect", "safe"],
    label: "Afraid",
    themes: ["Peace", "God's Presence", "Strength", "Faith"]
  },
  {
    emoji: "😣",
    keywords: ["overwhelmed", "burden", "heavy", "pressure", "weak", "help", "strength"],
    label: "Overwhelmed",
    themes: ["Comfort", "Strength", "Peace", "Prayer"]
  },
  {
    emoji: "😶",
    keywords: ["numb", "empty", "dry", "distant", "renew", "alive"],
    label: "Numb",
    themes: ["Renewal", "God's Presence", "Grace", "Hope"]
  },
  {
    emoji: "😌",
    keywords: ["calm", "peace", "rest", "quiet", "trust"],
    label: "Calm",
    themes: ["Peace", "Contentment", "Faith", "God's Presence"]
  },
  {
    emoji: "⭐",
    keywords: ["hope", "promise", "future", "persevere"],
    label: "Hopeful",
    themes: ["Hope", "Perseverance", "Renewal", "Faith"]
  },
  {
    emoji: "😊",
    keywords: ["joy", "praise", "delight", "glad"],
    label: "Joyful",
    themes: ["Joy", "Contentment", "Love", "Grace"]
  },
  {
    emoji: "🙏",
    keywords: ["thank", "thankful", "praise", "worship"],
    label: "Thankful",
    themes: ["Joy", "Prayer", "Grace", "Contentment"]
  }
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showStorageError(action = "save your changes") {
  Alert.alert(
    "Could not save",
    `The app could not ${action}. Please try again.`
  );
}

function shuffle(items) {
  const output = [...items];

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

function parseSeenIds(value) {
  if (!value) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

function parseSeenHistory(value) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    const entries = [];

    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        if (Array.isArray(entry) && entry.length >= 2) {
          entries.push(entry);
          return;
        }

        if (entry && typeof entry === "object") {
          entries.push([entry.id, entry.viewedAt ?? entry.timestamp ?? entry.seenAt]);
        }
      });
    } else if (parsed && typeof parsed === "object") {
      entries.push(...Object.entries(parsed));
    }

    return Object.fromEntries(
      entries
        .map(([id, timestamp]) => {
          const numericId = Number(id);
          const time = Date.parse(timestamp);

          if (!Number.isInteger(numericId) || Number.isNaN(time)) {
            return null;
          }

          return [String(numericId), new Date(time).toISOString()];
        })
        .filter(Boolean)
    );
  } catch {
    return {};
  }
}

function parseStoredIds(value) {
  return parseSeenIds(value);
}

function parseStoredNotes(value) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([id, note]) => Number.isInteger(Number(id)) && typeof note === "string")
    );
  } catch {
    return {};
  }
}

function parseStoredJournalEntries(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry) => entry && typeof entry === "object" && typeof entry.id === "string")
      .map((entry) => ({
        body: typeof entry.body === "string" ? entry.body : "",
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        id: entry.id,
        linkedItemId: Number.isInteger(entry.linkedItemId) ? entry.linkedItemId : null,
        promptLabel: typeof entry.promptLabel === "string" ? entry.promptLabel : "",
        title: typeof entry.title === "string" ? entry.title : "",
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString()
      }))
      .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());
  } catch {
    return [];
  }
}

function parseStoredPrayerRequests(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((request) => request && typeof request === "object" && typeof request.id === "string")
      .map((request) => ({
        answeredAt: typeof request.answeredAt === "string" ? request.answeredAt : null,
        body: typeof request.body === "string" ? request.body : "",
        category: PRAYER_CATEGORIES.includes(request.category) ? request.category : "Personal",
        createdAt: typeof request.createdAt === "string" ? request.createdAt : new Date().toISOString(),
        id: request.id,
        lastPrayedAt: typeof request.lastPrayedAt === "string" ? request.lastPrayedAt : null,
        linkedItemId: Number.isInteger(request.linkedItemId) ? request.linkedItemId : null,
        prayerCount: Number.isInteger(request.prayerCount) ? request.prayerCount : 0,
        title: typeof request.title === "string" ? request.title : "",
        updatedAt: typeof request.updatedAt === "string" ? request.updatedAt : new Date().toISOString()
      }))
      .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());
  } catch {
    return [];
  }
}

function parseStoredMoodEntries(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry) => entry && typeof entry === "object" && typeof entry.id === "string")
      .map((entry) => ({
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        gratitude: typeof entry.gratitude === "string" ? entry.gratitude : "",
        id: entry.id,
        mood: typeof entry.mood === "string" ? entry.mood : "",
        sleep: typeof entry.sleep === "string" ? entry.sleep : "",
        socialMood: typeof entry.socialMood === "string" ? entry.socialMood : ""
      }))
      .filter((entry) => entry.mood || entry.socialMood || entry.sleep || entry.gratitude)
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  } catch {
    return [];
  }
}

function getDateKey(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getReadableEntryDate(dateLike) {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long"
  });
}

function getReadableTrackerDate(dateLike) {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return "Selected day";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    weekday: "short"
  });
}

function getPercentage(count, total) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function getOptionStats(entries, options, key) {
  const total = entries.filter((entry) => entry[key]).length;

  return options.map((option) => {
    const count = entries.filter((entry) => entry[key] === option.label).length;

    return {
      count,
      label: option.label,
      percentage: getPercentage(count, total)
    };
  });
}

function getDisplayName(name, fallbackName) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : fallbackName;
}

function formatMoodLabel(label, shouldWrap = false) {
  if (!shouldWrap || label.length <= 9) {
    return label;
  }

  const breakIndex = Math.min(6, Math.max(4, Math.floor(label.length / 2)));
  return `${label.slice(0, breakIndex)}\u200B${label.slice(breakIndex)}`;
}

function renderTemplate(template, name, fallbackName) {
  return template.replace("{name}", getDisplayName(name, fallbackName));
}

function wrapEncouragementStatement(statement, maxLineLength = 34) {
  const words = statement.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxLineLength || currentLine.length === 0) {
      currentLine = candidate;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function formatEncouragementChunks(message, screenWidth) {
  const normalized = message.replace(/\s+/g, " ").trim();
  const maxLineLength = screenWidth < 360 ? 27 : 34;
  const nameMatch = normalized.match(/^([^,]{2,26}),\s+(.+)$/);
  const openingLine = nameMatch ? `${nameMatch[1]},` : null;
  const body = nameMatch ? nameMatch[2] : normalized;
  const sentences = body.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [body];
  const chunks = [];

  sentences.forEach((sentence) => {
    const lines = wrapEncouragementStatement(sentence, maxLineLength);

    if (lines.length > 0) {
      chunks.push(lines.join("\n"));
    }
  });

  return [openingLine, ...chunks].filter(Boolean);
}

function getVisibleEncouragementChunks(chunks, visibleCharacterCount) {
  let remaining = visibleCharacterCount;

  return chunks.map((chunk) => {
    if (remaining <= 0) {
      return "";
    }

    const visibleChunk = chunk.slice(0, remaining);
    remaining -= chunk.length;
    return visibleChunk;
  });
}

function shareTextFor(item, recipientName) {
  const message = renderTemplate(item.encouragement_template, recipientName, item.fallback_name);

  return `${message}\n\n"${item.verse_text}"\n${item.verse_reference}, KJV\n\nShared from ${APP_NAME}`;
}

function getEncouragementTokens(message) {
  return Array.from(message).map((value, index) => ({
    id: `${index}-${value}`,
    value
  }));
}

function getWordRevealTokens(message) {
  const matches = message.match(/\S+\s*/g) ?? [];

  return matches.map((value, index) => ({
    id: `${index}-${value}`,
    value
  }));
}

function getVisibleEncouragementText(tokens, visibleTokenCount) {
  return tokens
    .slice(0, visibleTokenCount)
    .map((token) => token.value)
    .join("");
}

function getEncouragementRevealDelay(tokens, visibleTokenCount) {
  if (visibleTokenCount === 0) {
    return 90;
  }

  const previousCharacter = tokens[visibleTokenCount - 1]?.value ?? "";

  if (/[.!?]/.test(previousCharacter)) {
    return 360;
  }

  if (/[,;:]/.test(previousCharacter)) {
    return 170;
  }

  if (/\s/.test(previousCharacter)) {
    return 18;
  }

  return 34;
}

function getEncouragementNotePreset(message, verseText, screenHeight, screenWidth) {
  const compactScreen = screenHeight < 840 || screenWidth < 360;
  const contentLoad = message.length + verseText.length * 1.35;

  if (contentLoad > 650 || (compactScreen && contentLoad > 500)) {
    return {
      actionButtonHeight: 40,
      actionGap: 8,
      actionMarginTop: 12,
      contentSpacerMinHeight: 8,
      messageChunkGap: 7,
      messageFontSize: compactScreen ? 17 : 18,
      messageLineHeight: compactScreen ? 24 : 26,
      nextButtonHeight: 44,
      panelPadding: compactScreen ? 22 : 24,
      scriptureBlockMarginTop: 14,
      scriptureCardPaddingHorizontal: compactScreen ? 14 : 16,
      scriptureCardPaddingVertical: compactScreen ? 12 : 14,
      scriptureFontSize: compactScreen ? 12.5 : 13.5,
      scriptureIntroFontSize: 11,
      scriptureLineHeight: compactScreen ? 18 : 20,
      scriptureReferenceFontSize: compactScreen ? 14 : 15,
      scriptureReferenceLineHeight: compactScreen ? 18 : 19,
      scriptureReferenceMarginTop: 8
    };
  }

  if (contentLoad > 500 || compactScreen) {
    return {
      actionButtonHeight: 42,
      actionGap: 10,
      actionMarginTop: 14,
      contentSpacerMinHeight: 18,
      messageChunkGap: 8,
      messageFontSize: 19,
      messageLineHeight: 28,
      nextButtonHeight: 44,
      panelPadding: 24,
      scriptureBlockMarginTop: 18,
      scriptureCardPaddingHorizontal: 16,
      scriptureCardPaddingVertical: 14,
      scriptureFontSize: 14,
      scriptureIntroFontSize: 11.5,
      scriptureLineHeight: 20,
      scriptureReferenceFontSize: 15,
      scriptureReferenceLineHeight: 19,
      scriptureReferenceMarginTop: 9
    };
  }

  return {
    actionButtonHeight: 44,
    actionGap: 12,
    actionMarginTop: 18,
    contentSpacerMinHeight: 34,
    messageChunkGap: 9,
    messageFontSize: 21,
    messageLineHeight: 31,
    nextButtonHeight: 46,
    panelPadding: 24,
    scriptureBlockMarginTop: 24,
    scriptureCardPaddingHorizontal: 18,
    scriptureCardPaddingVertical: 16,
    scriptureFontSize: 15,
    scriptureIntroFontSize: 12,
    scriptureLineHeight: 22,
    scriptureReferenceFontSize: 16,
    scriptureReferenceLineHeight: 20,
    scriptureReferenceMarginTop: 12
  };
}

function getSearchText(item, name) {
  return [
    renderTemplate(item.encouragement_template, name, item.fallback_name),
    item.verse_text,
    item.verse_reference,
    item.book,
    item.testament,
    ...(Array.isArray(item.themes) ? item.themes : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function itemMatchesFilter(item, filter, name) {
  if (!filter) {
    return true;
  }

  const themes = Array.isArray(item.themes) ? item.themes : [];

  if (filter.keywords) {
    const searchText = getSearchText(item, name);
    return filter.keywords.some((keyword) => searchText.includes(keyword));
  }

  return themes.includes(filter.label);
}

function getEncouragementById(id) {
  return encouragements.find((item) => item.id === id) ?? null;
}

function getJournalDateLabel(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getRecentTimeLabel(viewedAt, fallbackIndex = 0) {
  const viewedTime = Date.parse(viewedAt);

  if (!Number.isNaN(viewedTime)) {
    const diffMs = Math.max(Date.now() - viewedTime, 0);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) {
      return "Just now";
    }

    if (diffMs < hour) {
      return `${Math.max(1, Math.floor(diffMs / minute))}m ago`;
    }

    if (diffMs < day) {
      return `${Math.floor(diffMs / hour)}h ago`;
    }

    if (diffMs < day * 2) {
      return "Yesterday";
    }

    return `${Math.floor(diffMs / day)} days ago`;
  }

  if (fallbackIndex <= 0) {
    return "2h ago";
  }

  if (fallbackIndex === 1) {
    return "Yesterday";
  }

  return `${fallbackIndex} days ago`;
}

function recentEntryMatchesFilter(entry, filter) {
  const viewedTime = Date.parse(entry.viewedAt);

  if (!Number.isNaN(viewedTime)) {
    const viewedDate = new Date(viewedTime);
    const now = new Date();
    const diffMs = now.getTime() - viewedTime;
    const day = 24 * 60 * 60 * 1000;

    if (filter === "today") {
      return (
        viewedDate.getFullYear() === now.getFullYear() &&
        viewedDate.getMonth() === now.getMonth() &&
        viewedDate.getDate() === now.getDate()
      );
    }

    if (filter === "week") {
      return diffMs >= 0 && diffMs < day * 7;
    }

    if (filter === "month") {
      return diffMs >= 0 && diffMs < day * 31;
    }

    return true;
  }

  if (filter === "today") {
    return entry.index <= 0;
  }

  if (filter === "week") {
    return entry.index < 7;
  }

  if (filter === "month") {
    return entry.index < 30;
  }

  return true;
}

function formatPrayerCount(count) {
  return `Prayed ${count} ${count === 1 ? "time" : "times"}`;
}

function getDayKey(value = new Date()) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  const start = new Date(date.getFullYear(), 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((date - start) / dayMs);
}

function getDailyItem(items) {
  if (!items.length) {
    return null;
  }

  return items[getDayKey() % items.length];
}

function getTodayScriptureTextPreset(pageHeight = 812) {
  if (pageHeight >= 900) {
    return {
      verseFontSize: 13,
      verseLineHeight: 18
    };
  }

  if (pageHeight < 760) {
    return {
      verseFontSize: 11,
      verseLineHeight: 15
    };
  }

  return {
    verseFontSize: 12,
    verseLineHeight: 17
  };
}

function getTodayTextPreset(message, verseText, pageHeight = 812) {
  const messageLength = message.length;
  const verseLength = verseText.length;
  const scriptureTextPreset = getTodayScriptureTextPreset(pageHeight);

  if (pageHeight < 760) {
    if (messageLength > 320 || verseLength > 170) {
      return {
        messageFontSize: 11,
        messageLineHeight: 15,
        ...scriptureTextPreset
      };
    }

    if (messageLength > 280 || verseLength > 140) {
      return {
        messageFontSize: 12,
        messageLineHeight: 16,
        ...scriptureTextPreset
      };
    }

    if (messageLength > 220 || verseLength > 110) {
      return {
        messageFontSize: 13,
        messageLineHeight: 18,
        ...scriptureTextPreset
      };
    }

    return {
      messageFontSize: 15,
      messageLineHeight: 21,
      ...scriptureTextPreset
    };
  }

  if (pageHeight < 840) {
    if (messageLength > 320 || verseLength > 170) {
      return {
        messageFontSize: 13,
        messageLineHeight: 18,
        ...scriptureTextPreset
      };
    }

    if (messageLength > 280 || verseLength > 140) {
      return {
        messageFontSize: 14,
        messageLineHeight: 19,
        ...scriptureTextPreset
      };
    }

    if (messageLength > 220 || verseLength > 110) {
      return {
        messageFontSize: 15,
        messageLineHeight: 21,
        ...scriptureTextPreset
      };
    }

    return {
      messageFontSize: 18,
      messageLineHeight: 25,
      ...scriptureTextPreset
    };
  }

  if (messageLength > 335 || verseLength > 155) {
    return {
      messageFontSize: 16,
      messageLineHeight: 22,
      ...scriptureTextPreset
    };
  }

  if (messageLength > 300 || verseLength > 145) {
    return {
      messageFontSize: 17,
      messageLineHeight: 24,
      ...scriptureTextPreset
    };
  }

  if (messageLength > 280 || verseLength > 135) {
    return {
      messageFontSize: 16,
      messageLineHeight: 22,
      ...scriptureTextPreset
    };
  }

  if (messageLength > 220 || verseLength > 100) {
    return {
      messageFontSize: 18,
      messageLineHeight: 25,
      ...scriptureTextPreset
    };
  }

  return {
    messageFontSize: 22,
    messageLineHeight: 31,
    ...scriptureTextPreset
  };
}

function getTodayFeedItems(name) {
  const filteredItems = encouragements.filter((item) => {
    const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
    return message.length <= TODAY_MESSAGE_MAX_CHARS && item.verse_text.length <= TODAY_VERSE_MAX_CHARS;
  });

  return filteredItems.length > 0 ? filteredItems : encouragements;
}

function getMoodFeedItems(name, mood) {
  const baseItems = getTodayFeedItems(name);

  if (!mood) {
    return baseItems;
  }

  const moodThemes = new Set(mood.themes ?? []);
  const moodKeywords = (mood.keywords ?? []).map((keyword) => keyword.toLowerCase());
  const matchedItems = baseItems.filter((item) => {
    const themes = Array.isArray(item.themes) ? item.themes : [];
    const hasThemeMatch = themes.some((theme) => moodThemes.has(theme));

    if (hasThemeMatch) {
      return true;
    }

    const searchText = getSearchText(item, name);
    return moodKeywords.some((keyword) => searchText.includes(keyword));
  });

  return matchedItems.length > 0 ? matchedItems : baseItems;
}

function getUnseenQueue(seenIds, items = encouragements) {
  const safeSeenIds = seenIds instanceof Set ? seenIds : new Set();
  const sourceItems = items.length > 0 ? items : encouragements;
  const unseen = sourceItems.filter((item) => !safeSeenIds.has(item.id));
  return shuffle(unseen.length > 0 ? unseen : sourceItems);
}

function formatReminderHour(hour) {
  if (hour === null || hour === undefined || hour === "") {
    return "Off";
  }

  const hourNumber = Number.parseInt(`${hour}`, 10);

  if (!Number.isFinite(hourNumber)) {
    return "Off";
  }

  const normalizedHour = ((hourNumber % 24) + 24) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;

  return `${displayHour}:00 ${suffix}`;
}

async function requestNotificationPermission() {
  if (Platform.OS === "web") {
    Alert.alert(
      "Installed app only",
      "Daily reminders can be tested in the installed iPhone app or Expo Go, not in the browser preview."
    );
    return false;
  }

  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted || currentPermission.status === "granted") {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted || requestedPermission.status === "granted";
}

async function prepareNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("daily-reminder", {
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: APP_ACCENT,
    name: "Daily Reminder",
    sound: null,
    vibrationPattern: [0, 250, 250, 250]
  });
}

async function scheduleDailyReminder(hour = DEFAULT_NOTIFICATION_HOUR) {
  if (Platform.OS === "web") {
    return null;
  }

  const parsedHour = Number.parseInt(`${hour}`, 10);
  const safeHour = Number.isFinite(parsedHour)
    ? Math.max(0, Math.min(23, parsedHour))
    : DEFAULT_NOTIFICATION_HOUR;
  const trigger = {
    hour: safeHour,
    minute: 0,
    type: Notifications.SchedulableTriggerInputTypes.DAILY
  };

  if (Platform.OS === "android") {
    trigger.channelId = "daily-reminder";
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  await prepareNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      body: "Your daily Scripture encouragement is ready.",
      data: { screen: "checkIn" },
      sound: false,
      title: APP_NAME
    },
    identifier: "daily-notes-of-grace-daily-reminder",
    trigger
  });

  return safeHour;
}

async function cancelDailyReminder() {
  if (Platform.OS === "web") {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}

function Wordmark({ compact = false }) {
  return (
    <Text style={[styles.wordmark, compact ? styles.wordmarkCompact : styles.wordmarkLarge]}>
      Daily{"\n"}Notes{"\n"}of Grace
    </Text>
  );
}

function SplashScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.splashContent}>
        <Wordmark />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function NameScreen({ initialName, onContinue }) {
  const [name, setName] = useState(initialName);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.nameContent}
      >
        <View>
          <Text style={styles.nameTitle}>What{"'"}s{"\n"}your{"\n"}name?</Text>
          <TextInput
            accessibilityLabel="Your name"
            autoCapitalize="words"
            autoCorrect={false}
            cursorColor={TOKENS.colors.accentHover}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={TOKENS.colors.placeholder}
            returnKeyType="done"
            selectionColor={TOKENS.colors.inputSelection}
            style={styles.nameInput}
            value={name}
          />
        </View>

        <View style={styles.nameActions}>
          <Pressable
            accessibilityLabel="Continue without a name"
            accessibilityRole="button"
            onPress={() => onContinue("")}
            style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
          >
            <Text style={styles.textButtonLabel}>Continue Without a Name</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Continue"
            accessibilityRole="button"
            onPress={() => onContinue(name)}
            style={({ pressed }) => [styles.arrowButton, pressed && styles.arrowButtonPressed]}
          >
            <Text style={styles.arrowButtonLabel}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function EmptyFeed() {
  return (
    <View style={styles.loadingFeed}>
      <ActivityIndicator color={APP_ACCENT_HOVER} />
    </View>
  );
}

function IconButton({ label, onPress, selected = false }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        selected && styles.iconButtonSelected,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.iconButtonLabel, selected && styles.iconButtonLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function HeartGlyph() {
  return <Text style={styles.heartGlyph}>♥</Text>;
}

function ShareGlyph() {
  return (
    <View style={styles.shareGlyph}>
      <View style={styles.shareGlyphStem} />
      <Text style={styles.shareGlyphArrow}>↗</Text>
    </View>
  );
}

function ActionButton({ children, icon, onPress }) {
  return (
    <Pressable
      accessibilityLabel={typeof children === "string" ? children : undefined}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
    >
      {icon ? icon : null}
      <Text style={styles.actionButtonLabel}>{children}</Text>
    </Pressable>
  );
}

function SoftReveal({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 360,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: Platform.OS !== "web"
        }),
        Animated.timing(translateY, {
          duration: 360,
          easing: Easing.out(Easing.quad),
          toValue: 0,
          useNativeDriver: Platform.OS !== "web"
        })
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function FadeReveal({ children, delay = 0, style, visible = true }) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    let timer = null;

    if (!visible) {
      opacity.setValue(0);
      return () => {};
    }

    opacity.setValue(0);

    timer = setTimeout(() => {
      Animated.timing(opacity, {
        duration: 420,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: Platform.OS !== "web"
      }).start();
    }, delay);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [delay, opacity, visible]);

  return (
    <Animated.View
      style={[style, { opacity, pointerEvents: visible ? "auto" : "none" }]}
    >
      {children}
    </Animated.View>
  );
}

function ReadingDockAction({ label, onPress, primary = false }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.readingDockAction,
        primary && styles.readingDockActionPrimary,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.readingDockActionText, primary && styles.readingDockActionTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function BottomNavAction({
  Icon = Feather,
  displayLabel,
  disabled = false,
  iconName,
  label,
  labelLines = 1,
  onPress,
  selected = false,
  showDivider = false
}) {
  const [hovered, setHovered] = useState(false);
  const [pressing, setPressing] = useState(false);
  const pressScale = useRef(new Animated.Value(1)).current;

  const animateScale = useCallback(
    (toValue) => {
      Animated.timing(pressScale, {
        duration: toValue < 1 ? 120 : 150,
        easing: Easing.out(Easing.quad),
        toValue,
        useNativeDriver: Platform.OS !== "web"
      }).start();
    },
    [pressScale]
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      onPressIn={() => {
        setPressing(true);
        animateScale(0.95);
      }}
      onPressOut={() => {
        setPressing(false);
        animateScale(1);
      }}
      style={[
        styles.bottomNavAction,
        hovered && !selected && !disabled && styles.bottomNavActionHovered,
        disabled && styles.bottomNavActionDisabled,
        !disabled && styles.bottomNavActionInteractive
      ]}
    >
      {showDivider ? <View style={styles.bottomNavDivider} /> : null}
      <Animated.View
        style={[
          styles.bottomNavInner,
          hovered && !selected && !disabled && styles.bottomNavInnerHover,
          selected && styles.bottomNavInnerSelected,
          hovered && selected && !disabled && styles.bottomNavInnerSelectedHover,
          pressing && !disabled && styles.bottomNavInnerPressed,
          {
            transform: [
              { translateY: hovered && !selected && !disabled ? -2 : 0 },
              { scale: pressScale }
            ]
          }
        ]}
      >
        <Icon name={iconName} size={22} color={selected ? TOKENS.colors.accent : TOKENS.colors.textTertiary} />
        {selected ? <View style={styles.bottomNavActiveLine} /> : null}
        <Text
          adjustsFontSizeToFit
          numberOfLines={labelLines}
          style={[styles.bottomNavLabel, selected && styles.bottomNavLabelSelected]}
        >
          {displayLabel ?? label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function AppBottomNav({
  accessibilityHidden = true,
  onOpenHome,
  onOpenMoodTracker,
  onOpenSaved,
  onOpenJournal,
  onOpenProfile,
  selected = "checkIn"
}) {
  return (
    <View
      accessibilityElementsHidden={accessibilityHidden}
      importantForAccessibility={accessibilityHidden ? "no-hide-descendants" : "auto"}
      pointerEvents={accessibilityHidden ? "none" : "auto"}
      style={[styles.dailyActionNav, accessibilityHidden && styles.chromePlaceholderHidden]}
    >
      <BottomNavAction
        Icon={Feather}
        iconName="check-circle"
        label="Check in"
        onPress={onOpenHome}
        selected={selected === "checkIn" || selected === "home"}
      />
      <BottomNavAction
        displayLabel={"Mood\nTracker"}
        Icon={Feather}
        iconName="bar-chart-2"
        labelLines={2}
        label="Mood Tracker"
        onPress={onOpenMoodTracker}
        selected={selected === "moodTracker"}
        showDivider
      />
      <BottomNavAction
        Icon={Ionicons}
        iconName="bookmarks-outline"
        label="My Notes"
        onPress={onOpenSaved}
        selected={selected === "notes" || selected === "saved" || selected === "save" || selected === "journal" || selected === "reflect"}
        showDivider
      />
      <BottomNavAction
        Icon={Ionicons}
        iconName="person-outline"
        label="Profile"
        onPress={onOpenProfile}
        selected={selected === "profile"}
        showDivider
      />
    </View>
  );
}

function AboutValueCard({ body, Icon = Ionicons, iconName, title }) {
  return (
    <View style={styles.aboutValueCard}>
      <View style={styles.aboutValueIconBadge}>
        <Icon name={iconName} size={23} color={APP_ACCENT} />
      </View>
      <View style={styles.aboutValueCopy}>
        <Text style={styles.aboutValueTitle}>{title}</Text>
        <Text style={styles.aboutValueBody}>{body}</Text>
      </View>
    </View>
  );
}

function AppTopNav({ onOpenSettings, padded = true }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.todayTopArea, padded && styles.appTopPadded, styles.chromePlaceholderHidden]}
    >
      <View style={styles.todayTopBar}>
        <View style={styles.todayLogoWrap}>
          <Wordmark compact />
        </View>
        <Pressable
          accessibilityLabel="Open menu"
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={({ pressed }) => [styles.todayMenuButton, pressed && styles.pressed]}
        >
          <Feather name="menu" size={19} color={APP_ACCENT} />
        </Pressable>
      </View>
    </View>
  );
}

function getChromeSelectedTab(screen, returnTab = "checkIn") {
  if (screen === "checkIn") {
    return "checkIn";
  }

  if (screen === "home") {
    return "checkIn";
  }

  if (screen === "moodTracker") {
    return "moodTracker";
  }

  if (screen === "saved" || screen === "journal" || screen === "prayer" || screen === "recent" || screen === "explore") {
    return "notes";
  }

  if (screen === "settings" || screen === "about" || screen === "privacy" || screen === "care") {
    return "profile";
  }

  if (screen === "encouragement") {
    if (returnTab === "home") {
      return "checkIn";
    }

    if (returnTab === "saved" || returnTab === "save" || returnTab === "journal" || returnTab === "reflect" || returnTab === "recent" || returnTab === "explore") {
      return "notes";
    }

    return returnTab;
  }

  return null;
}

function StaticAppChrome({
  onOpenCheckIn,
  onOpenHome,
  onOpenMoodTracker,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  selected
}) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.staticChromeLayer}>
      <View
        pointerEvents="none"
        style={[styles.staticChromeTopWash, { height: insets.top + 78 }]}
      />
      <View
        pointerEvents="box-none"
        style={[styles.staticChromeTop, { top: insets.top + 14 }]}
      >
        <View style={styles.todayTopBar}>
          <View style={styles.todayLogoWrap}>
            <Wordmark compact />
          </View>
          <Pressable
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={({ pressed }) => [styles.todayMenuButton, pressed && styles.pressed]}
          >
            <Feather name="menu" size={19} color={APP_ACCENT} />
          </Pressable>
        </View>
      </View>

      <View
        pointerEvents="none"
        style={[styles.staticChromeBottomWash, { height: insets.bottom + 84 }]}
      />
      <View
        pointerEvents="box-none"
        style={[styles.staticChromeBottom, { bottom: insets.bottom + 8 }]}
      >
        <AppBottomNav
          accessibilityHidden={false}
          onOpenHome={onOpenCheckIn ?? onOpenHome}
          onOpenMoodTracker={onOpenMoodTracker}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected={selected}
        />
      </View>
    </View>
  );
}

function DailyActionNav({ isSaved = false, item, onOpenHome, onShare, onStartJournal, onStartPrayer, onToggleSaved }) {
  return (
    <View style={styles.dailyActionNav}>
      <BottomNavAction Icon={Ionicons} iconName="home-outline" label="Home" onPress={onOpenHome} selected />
      <BottomNavAction
        Icon={Ionicons}
        iconName={isSaved ? "bookmark" : "bookmark-outline"}
        label="Save"
        onPress={() => onToggleSaved(item.id)}
        showDivider
      />
      <BottomNavAction
        Icon={Feather}
        iconName="edit-3"
        label="Reflect"
        onPress={() => onStartJournal(item)}
        showDivider
      />
      <BottomNavAction
        Icon={MaterialCommunityIcons}
        iconName="hands-pray"
        label="Pray"
        onPress={() => onStartPrayer(item)}
        showDivider
      />
      <BottomNavAction
        Icon={Feather}
        iconName="send"
        label="Share"
        onPress={() => onShare(item)}
        showDivider
      />
    </View>
  );
}

function DailyCheckInCard({ actionLabel, body, onPress, title }) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${actionLabel}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.dailyCard, pressed && styles.pressed]}
    >
      <Text style={styles.dailyCardTitle}>{title}</Text>
      <Text style={styles.dailyCardBody}>{body}</Text>
      <Text style={styles.dailyCardAction}>{actionLabel}</Text>
    </Pressable>
  );
}

function HomeSectionHeader({ Icon = Feather, iconName, title, aside }) {
  return (
    <View style={styles.homeSectionHeader}>
      <View style={styles.homeSectionHeading}>
        <View style={styles.homeSectionIcon}>
          <Icon name={iconName} size={14} color={APP_ACCENT} />
        </View>
        <Text numberOfLines={1} style={styles.homeSectionHeadingText}>{title}</Text>
      </View>
      <View style={styles.homeSectionLine} />
      <Text numberOfLines={1} style={styles.homeSectionAside}>{aside}</Text>
    </View>
  );
}

function HomeDashboardTile({
  actionLabel,
  body,
  Icon = Feather,
  iconName,
  onPress,
  title,
  compact = false
}) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${actionLabel}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.homeDashboardTile,
        compact && styles.homeDashboardTileCompact,
        styles.homeInteractiveBase,
        hovered && styles.homeInteractiveHover,
        pressed && styles.homeInteractivePressed
      ]}
    >
      <View style={styles.homeTileIconBadge}>
        <Icon name={iconName} size={compact ? 17 : 19} color={APP_ACCENT} />
      </View>
      <Text numberOfLines={1} style={styles.homeDashboardTileTitle}>{title}</Text>
      <Text numberOfLines={2} style={styles.homeDashboardTileBody}>{body}</Text>
      <View style={styles.homeTileActionRow}>
        <Text numberOfLines={1} style={styles.homeTileAction}>{actionLabel}</Text>
        <Feather name="chevron-right" size={13} color={APP_ACCENT} />
      </View>
    </Pressable>
  );
}

function HomeMoodCard({
  cardHeight,
  cardWidth,
  emojiSize,
  iconSize,
  labelFontSize,
  labelText,
  mood,
  onPress
}) {
  return (
    <Pressable
      accessibilityLabel={`I feel ${mood.label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.homeMoodCard,
        cardWidth
          ? {
              flexBasis: cardWidth,
              height: cardHeight,
              maxWidth: cardWidth,
              minWidth: cardWidth,
              width: cardWidth
            }
          : null,
        styles.homeInteractiveBase,
        hovered && styles.homeMoodCardHover,
        pressed && styles.homeMoodCardPressed
      ]}
    >
      <View
        style={[
          styles.homeMoodIcon,
          iconSize ? { borderRadius: iconSize / 2, height: iconSize, width: iconSize } : null
        ]}
      >
        <Text
          style={[
            styles.homeMoodEmoji,
            emojiSize ? { fontSize: emojiSize, lineHeight: emojiSize + 4 } : null
          ]}
        >
          {mood.emoji}
        </Text>
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={2}
        style={[
          styles.homeMoodLabel,
          labelFontSize ? { fontSize: labelFontSize, lineHeight: labelFontSize + 3 } : null
        ]}
      >
        {labelText ?? mood.label}
      </Text>
    </Pressable>
  );
}

function CheckInOptionPill({ onPress, option, selected }) {
  return (
    <Pressable
      accessibilityLabel={option.label}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.checkInOptionPill,
        selected && styles.checkInOptionPillSelected,
        hovered && !selected && styles.checkInOptionPillHover,
        pressed && styles.checkInOptionPillPressed
      ]}
    >
      <View style={[styles.checkInOptionIcon, selected && styles.checkInOptionIconSelected]}>
        <Text style={styles.checkInOptionEmoji}>{option.emoji}</Text>
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={1}
        style={[styles.checkInOptionLabel, selected && styles.checkInOptionLabelSelected]}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

function MoodStatRow({ accent = APP_ACCENT, count, label, percentage }) {
  return (
    <View style={styles.moodStatRow}>
      <Text style={styles.moodStatLabel}>{label}</Text>
      <View style={styles.moodStatTrack}>
        <View
          style={[
            styles.moodStatFill,
            { backgroundColor: accent, width: percentage === "0%" ? 2 : percentage }
          ]}
        />
      </View>
      <Text style={styles.moodStatValue}>{percentage}</Text>
    </View>
  );
}

function getDominantStat(stats) {
  return stats.reduce((winner, stat) => {
    if (!winner || stat.count > winner.count) {
      return stat;
    }

    return winner;
  }, null);
}

function getMoodTrackerStreak(entriesByDate) {
  const today = new Date();
  let streak = 0;

  for (let offset = 0; offset < MOOD_HEATMAP_DAYS; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = getDateKey(date);

    if (!entriesByDate[key]) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function getMoodTrackerInsight({ gratitudeCount, moodTop, safeEntries, sleepTop, socialTop }) {
  if (!safeEntries.length) {
    return {
      body: "Once you complete your first daily check-in, this page will begin showing patterns in your mood, rest, social energy, and gratitude.",
      title: "Start with one quiet check-in"
    };
  }

  if (sleepTop?.label === "Poor") {
    return {
      body: "Poor sleep is appearing often. Keep the check-in gentle on hard mornings and let the encouragement meet you with smaller, steadier steps.",
      title: "Rest is part of the pattern"
    };
  }

  if (["Discouraged", "Tired", "Anxious", "Afraid", "Lonely", "Overwhelmed", "Numb"].includes(moodTop?.label)) {
    return {
      body: `${moodTop.label} has shown up most often. That gives the app a clearer way to bring Scripture that speaks to weariness, fear, and hope without making you explain everything again.`,
      title: "Your pattern can guide the care"
    };
  }

  if (gratitudeCount >= 3) {
    return {
      body: "Your thankfulness entries are beginning to form a record of God’s kindness in ordinary days. Keep them short; consistency matters more than length.",
      title: "Gratitude is becoming visible"
    };
  }

  if (socialTop?.label === "Isolated" || socialTop?.label === "Withdrawn") {
    return {
      body: "Your social energy has been quieter. The goal is not pressure; it is noticing where encouragement, prayer, and simple connection may help.",
      title: "Notice the quieter days"
    };
  }

  return {
    body: "The tracker is beginning to show how your days are unfolding. Keep checking in, and the app will become better at helping you return to Scripture with clarity.",
    title: "A clearer spiritual rhythm"
  };
}

function MoodTrackerMetric({ accent = APP_ACCENT, Icon = Feather, iconName, label, value }) {
  return (
    <View style={styles.moodMetricCard}>
      <View style={[styles.moodMetricIcon, { backgroundColor: `${accent}18` }]}>
        <Icon name={iconName} size={18} color={accent} />
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        style={styles.moodMetricValue}
      >
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.moodMetricLabel}>{label}</Text>
    </View>
  );
}

function MoodDistributionCard({ accent = APP_ACCENT, Icon = Feather, iconName, stats, subtitle, title }) {
  const dominant = getDominantStat(stats);
  const total = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <View style={styles.moodPatternCard}>
      <View style={styles.moodPatternHeader}>
        <View style={[styles.moodPatternIcon, { backgroundColor: `${accent}16` }]}>
          <Icon name={iconName} size={19} color={accent} />
        </View>
        <View style={styles.moodPatternTitleGroup}>
          <Text style={styles.moodPatternTitle}>{title}</Text>
          <Text style={styles.moodPatternSubtitle}>{total ? subtitle : "No answers yet"}</Text>
        </View>
      </View>
      {dominant?.count ? (
        <View style={styles.moodDominantPill}>
          <Text style={[styles.moodDominantValue, { color: accent }]}>{dominant.percentage}</Text>
          <Text numberOfLines={1} style={styles.moodDominantLabel}>{dominant.label}</Text>
        </View>
      ) : null}
      <View style={styles.moodPatternRows}>
        {stats.map((stat) => (
          <MoodStatRow key={stat.label} {...stat} accent={accent} />
        ))}
      </View>
    </View>
  );
}

function MoodTrackerScreen({
  entries,
  onOpenHome,
  onOpenJournal,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;
  const safeEntries = Array.isArray(entries) ? entries : [];
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(getDateKey(new Date()));
  const entriesByDate = useMemo(() => {
    const map = {};

    safeEntries.forEach((entry) => {
      const key = getDateKey(entry.createdAt);

      if (key) {
        map[key] = [...(map[key] ?? []), entry];
      }
    });

    Object.values(map).forEach((dayEntries) => {
      dayEntries.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
    });

    return map;
  }, [safeEntries]);
  const days = useMemo(() => {
    const today = new Date();

    return Array.from({ length: MOOD_HEATMAP_DAYS }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (MOOD_HEATMAP_DAYS - 1 - index));
      const key = getDateKey(date);
      const dayEntries = entriesByDate[key] ?? [];

      return {
        count: dayEntries.length,
        date,
        entries: dayEntries,
        key
      };
    });
  }, [entriesByDate]);
  const weeks = Array.from(
    { length: Math.ceil(days.length / MOOD_HEATMAP_ROWS) },
    (_, weekIndex) => days.slice(weekIndex * MOOD_HEATMAP_ROWS, weekIndex * MOOD_HEATMAP_ROWS + MOOD_HEATMAP_ROWS)
  );
  const selectedDay = days.find((day) => day.key === selectedHeatmapDay) ?? days[days.length - 1];
  const selectedDayEntries = selectedDay?.entries ?? [];
  const moodStats = getOptionStats(safeEntries, MOOD_OPTIONS, "mood");
  const socialStats = getOptionStats(safeEntries, SOCIAL_MOOD_OPTIONS, "socialMood");
  const sleepStats = getOptionStats(safeEntries, SLEEP_OPTIONS, "sleep");
  const gratitudeEntries = safeEntries.filter((entry) => entry.gratitude.trim());
  const recentGratitudeEntries = gratitudeEntries.slice(0, 6);
  const activeDays = days.filter((day) => day.count > 0).length;
  const currentStreak = getMoodTrackerStreak(entriesByDate);
  const moodTop = getDominantStat(moodStats);
  const socialTop = getDominantStat(socialStats);
  const sleepTop = getDominantStat(sleepStats);
  const insight = getMoodTrackerInsight({
    gratitudeCount: gratitudeEntries.length,
    moodTop,
    safeEntries,
    sleepTop,
    socialTop
  });

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <ScrollView
          contentContainerStyle={[styles.moodTrackerContent, styles.subscreenContentWithNav]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.moodTrackerHeroCard}>
            <View style={styles.moodTrackerHeroGlowOne} />
            <View style={styles.moodTrackerHeroGlowTwo} />
            <View style={styles.moodTrackerHeroHeader}>
              <View style={styles.moodTrackerHeroIcon}>
                <Feather name="bar-chart-2" size={22} color={TOKENS.colors.textInverse} />
              </View>
              <Text style={styles.moodTrackerHeroKicker}>Daily rhythm</Text>
            </View>
            <Text style={styles.moodTrackerTitle}>Mood Tracker</Text>
            <Text style={styles.moodTrackerSubtitle}>
              Notice patterns in your day, then return to Scripture with more clarity.
            </Text>
            <View style={styles.moodTrackerHeroStats}>
              <View style={styles.moodTrackerHeroStat}>
                <Text style={styles.moodTrackerHeroStatValue}>{safeEntries.length}</Text>
                <Text style={styles.moodTrackerHeroStatLabel}>check-ins</Text>
              </View>
              <View style={styles.moodTrackerHeroDivider} />
              <View style={styles.moodTrackerHeroStat}>
                <Text style={styles.moodTrackerHeroStatValue}>{currentStreak}</Text>
                <Text style={styles.moodTrackerHeroStatLabel}>day streak</Text>
              </View>
              <View style={styles.moodTrackerHeroDivider} />
              <View style={styles.moodTrackerHeroStat}>
                <Text style={styles.moodTrackerHeroStatValue}>{activeDays}</Text>
                <Text style={styles.moodTrackerHeroStatLabel}>tracked days</Text>
              </View>
            </View>
          </View>

          <View style={[styles.moodSummaryGrid, isNarrow && styles.moodSummaryGridStacked]}>
            <MoodTrackerMetric
              Icon={Ionicons}
              accent="#4F46E5"
              iconName="happy-outline"
              label="most common"
              value={moodTop?.count ? moodTop.label : "No mood"}
            />
            <MoodTrackerMetric
              Icon={Feather}
              accent="#0891B2"
              iconName="users"
              label="social energy"
              value={socialTop?.count ? socialTop.label : "Not yet"}
            />
            <MoodTrackerMetric
              Icon={Ionicons}
              accent="#7C3AED"
              iconName="moon-outline"
              label="sleep pattern"
              value={sleepTop?.count ? sleepTop.label : "Not yet"}
            />
          </View>

          <View style={styles.moodTrackerCard}>
            <View style={styles.moodTrackerCardHeader}>
              <View style={styles.moodTrackerCardHeaderCopy}>
                <Text style={styles.moodTrackerCardTitle}>Last 6 months</Text>
                <Text style={styles.moodTrackerCardMeta}>
                  {activeDays} active days · tap a day to review it
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Start today's check-in"
                accessibilityRole="button"
                onPress={onOpenHome}
                style={({ hovered, pressed }) => [
                  styles.moodCheckInButton,
                  hovered && styles.moodCheckInButtonHover,
                  pressed && styles.moodCheckInButtonPressed
                ]}
              >
                <Text style={styles.moodCheckInButtonText}>Check in</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.moodHeatmapScroll}
            >
              <View style={styles.moodHeatmap}>
                {weeks.map((week, weekIndex) => (
                  <View key={`week-${weekIndex}`} style={styles.moodHeatmapWeek}>
                    {week.map((day) => (
                      <Pressable
                        accessibilityLabel={`${getReadableTrackerDate(day.date)}: ${day.count ? `${day.count} check-in${day.count === 1 ? "" : "s"}` : "no check-in"}`}
                        accessibilityRole="button"
                        key={day.key}
                        onPress={() => setSelectedHeatmapDay(day.key)}
                        style={[
                          styles.moodHeatmapDay,
                          day.count > 0 && styles.moodHeatmapDayActive,
                          day.count > 1 && styles.moodHeatmapDayStrong,
                          selectedDay?.key === day.key && styles.moodHeatmapDaySelected
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.moodHeatmapLegend}>
              <View style={styles.moodLegendItem}>
                <View style={styles.moodLegendQuiet} />
                <Text style={styles.moodLegendText}>quiet</Text>
              </View>
              <View style={styles.moodLegendItem}>
                <View style={styles.moodLegendChecked} />
                <Text style={styles.moodLegendText}>one check</Text>
              </View>
              <View style={styles.moodLegendItem}>
                <View style={styles.moodLegendStrong} />
                <Text style={styles.moodLegendText}>multiple</Text>
              </View>
            </View>
            <View style={styles.moodSelectedDayCard}>
              <View style={styles.moodSelectedDayHeader}>
                <View>
                  <Text style={styles.moodSelectedDayKicker}>Selected day</Text>
                  <Text style={styles.moodSelectedDayTitle}>{getReadableTrackerDate(selectedDay?.date)}</Text>
                </View>
                <View style={styles.moodSelectedDayCountBadge}>
                  <Text style={styles.moodSelectedDayCount}>{selectedDayEntries.length}</Text>
                </View>
              </View>
              {selectedDayEntries.length ? (
                selectedDayEntries.slice(0, 2).map((entry) => (
                  <View key={entry.id} style={styles.moodSelectedEntry}>
                    <View style={styles.moodSelectedEntryRow}>
                      <Text style={styles.moodSelectedEntryTitle}>{entry.mood || "Mood not recorded"}</Text>
                      <Text style={styles.moodSelectedEntryMeta}>
                        {[entry.socialMood, entry.sleep ? `${entry.sleep} sleep` : ""].filter(Boolean).join(" · ")}
                      </Text>
                    </View>
                    {entry.gratitude ? (
                      <Text numberOfLines={2} style={styles.moodSelectedEntryGratitude}>
                        Thankful: {entry.gratitude}
                      </Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={styles.moodSelectedEmptyText}>
                  No check-in recorded for this day.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.moodInsightCard}>
            <View style={styles.moodInsightIcon}>
              <Feather name="compass" size={19} color={APP_ACCENT} />
            </View>
            <View style={styles.moodInsightCopy}>
              <Text style={styles.moodInsightTitle}>{insight.title}</Text>
              <Text style={styles.moodInsightBody}>{insight.body}</Text>
            </View>
          </View>

          <View style={styles.moodPatternGrid}>
            <MoodDistributionCard
              Icon={Ionicons}
              accent="#4F46E5"
              iconName="happy-outline"
              stats={moodStats}
              subtitle="How your heart has been feeling"
              title="Mood"
            />
            <MoodDistributionCard
              Icon={Feather}
              accent="#0891B2"
              iconName="users"
              stats={socialStats}
              subtitle="How connected your days have felt"
              title="Social"
            />
            <MoodDistributionCard
              Icon={Ionicons}
              accent="#7C3AED"
              iconName="moon-outline"
              stats={sleepStats}
              subtitle="How your nights are shaping mornings"
              title="Sleep"
            />
          </View>

          {recentGratitudeEntries.length ? (
            <View style={styles.moodTrackerCard}>
              <View style={styles.moodTrackerCardHeader}>
                <View style={styles.moodTrackerCardHeaderCopy}>
                  <Text style={styles.moodTrackerCardTitle}>Thankfulness journal</Text>
                  <Text style={styles.moodTrackerCardMeta}>Most recent entries</Text>
                </View>
                <View style={styles.moodGratitudeBadge}>
                  <Text style={styles.moodGratitudeBadgeText}>{gratitudeEntries.length}</Text>
                </View>
              </View>
              {recentGratitudeEntries.map((entry) => (
                <View key={entry.id} style={styles.gratitudeEntry}>
                  <Text style={styles.gratitudeDate}>On {getReadableEntryDate(entry.createdAt)}:</Text>
                  <Text style={styles.gratitudeText}>“{entry.gratitude}”</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.moodEmptyGratitudeCard}>
              <View style={styles.moodEmptyGratitudeIcon}>
                <Feather name="heart" size={18} color={APP_ACCENT} />
              </View>
              <View style={styles.moodEmptyGratitudeCopy}>
                <Text style={styles.moodEmptyGratitudeTitle}>No gratitude notes yet</Text>
                <Text style={styles.moodEmptyGratitudeText}>
                  When you write one during check-in, it will appear here as a quiet record of thanks.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="moodTracker"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function MenuSection({ children, title }) {
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <View style={styles.menuSectionRows}>{children}</View>
    </View>
  );
}

function MenuRow({ Icon = Feather, iconName, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.menuRow,
        hovered && styles.menuRowHover,
        pressed && styles.menuRowPressed
      ]}
    >
      <View style={styles.menuRowIcon}>
        <Icon name={iconName} size={20} color={APP_ACCENT} />
      </View>
      <Text numberOfLines={1} style={styles.menuRowLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color={TOKENS.colors.textTertiary} />
    </Pressable>
  );
}

function AppMenu({ name, onClose, onNavigate, onResetSeen, visible }) {
  const displayName = getDisplayName(name, "Christian");
  const menuContent = (
    <View style={styles.menuOverlay}>
      <Pressable
        accessibilityLabel="Close menu"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.menuScrim}
      />
      <SafeAreaView style={styles.menuPanel}>
        <ScrollView
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.menuCloseRow}>
            <Pressable
              accessibilityLabel="Close menu"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.menuCloseButton, pressed && styles.pressed]}
            >
              <Feather name="x" size={22} color={APP_ACCENT} />
            </Pressable>
          </View>

          <View style={styles.menuGreeting}>
            <View style={styles.menuGreetingTitleRow}>
              <Text style={styles.menuGreetingTitle}>Good morning,{"\n"}{displayName}</Text>
              <View style={styles.menuCrown}>
                <MaterialCommunityIcons name="crown-outline" size={17} color={APP_ACCENT} />
              </View>
            </View>
            <Text style={styles.menuGreetingCopy}>
              Quiet Scripture encouragement for today.
            </Text>
          </View>

          <MenuSection title="Library">
            <MenuRow iconName="bookmark" label="My Notes" onPress={() => onNavigate("saved")} />
            <MenuRow iconName="clock" label="Recently Seen" onPress={() => onNavigate("recent")} />
          </MenuSection>

          <MenuSection title="Practice">
            <MenuRow iconName="bar-chart-2" label="Mood Tracker" onPress={() => onNavigate("moodTracker")} />
            <MenuRow iconName="edit-3" label="Journal" onPress={() => onNavigate("journal")} />
            <MenuRow
              Icon={MaterialCommunityIcons}
              iconName="hands-pray"
              label="Prayer"
              onPress={() => onNavigate("prayer")}
            />
          </MenuSection>

          <MenuSection title="Explore">
            <MenuRow iconName="search" label="Browse Scripture" onPress={() => onNavigate("explore")} />
          </MenuSection>

          <MenuSection title="App">
            <MenuRow iconName="user" label="Profile" onPress={() => onNavigate("settings")} />
            <MenuRow iconName="info" label="About" onPress={() => onNavigate("about")} />
            <MenuRow iconName="shield" label="Privacy" onPress={() => onNavigate("privacy")} />
          </MenuSection>

          <Pressable
            accessibilityLabel="Care Note"
            accessibilityRole="button"
            onPress={() => onNavigate("care")}
            style={({ pressed }) => [styles.menuCareNote, pressed && styles.pressed]}
          >
            <View style={styles.menuCareIcon}>
              <Feather name="heart" size={24} color={APP_ACCENT} />
            </View>
            <View style={styles.menuCareText}>
              <Text style={styles.menuCareTitle}>Care Note</Text>
              <Text style={styles.menuCareBody}>
                These notes are for spiritual encouragement and are not a replacement for pastoral,
                medical, mental health, or emergency care.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={TOKENS.colors.textTertiary} />
          </Pressable>

          <Pressable
            accessibilityLabel="Reset Seen Notes"
            accessibilityRole="button"
            onPress={onResetSeen}
            style={({ pressed }) => [styles.menuResetButton, pressed && styles.pressed]}
          >
            <View style={styles.menuResetIcon}>
              <Feather name="refresh-cw" size={24} color={APP_ACCENT} />
            </View>
            <Text style={styles.menuResetLabel}>Reset reading history</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View
        accessibilityElementsHidden={!visible}
        aria-hidden={!visible}
        importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
        style={[styles.menuWebPortal, !visible && styles.menuWebPortalHidden]}
      >
        {menuContent}
      </View>
    );
  }

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      {menuContent}
    </Modal>
  );
}

const MenuHost = React.memo(React.forwardRef(function MenuHost(
  { name, onNavigate, onResetSeen },
  ref
) {
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const navigate = useCallback(
    (nextScreen) => {
      setVisible(false);
      onNavigate(nextScreen);
    },
    [onNavigate]
  );

  const resetSeen = useCallback(() => {
    setVisible(false);
    onResetSeen();
  }, [onResetSeen]);

  useImperativeHandle(ref, () => ({ close, open }), [close, open]);

  return (
    <AppMenu
      name={name}
      onClose={close}
      onNavigate={navigate}
      onResetSeen={resetSeen}
      visible={visible}
    />
  );
}));

function HomeScreen({
  name,
  onOpenHome,
  onOpenJournal,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onCompleteCheckIn
}) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSocialMood, setSelectedSocialMood] = useState(null);
  const [selectedSleep, setSelectedSleep] = useState(null);
  const [gratitude, setGratitude] = useState("");
  const displayName = getDisplayName(name, "Christian");
  const questions = [
    {
      key: "mood",
      title: `How are you feeling today,\n${displayName}?`,
      options: MOOD_OPTIONS,
      selected: selectedMood,
      onSelect: setSelectedMood
    },
    {
      key: "social",
      title: "Are you in a social mood?",
      options: SOCIAL_MOOD_OPTIONS,
      selected: selectedSocialMood,
      onSelect: setSelectedSocialMood
    },
    {
      key: "sleep",
      title: "How did you sleep last night?",
      options: SLEEP_OPTIONS,
      selected: selectedSleep,
      onSelect: setSelectedSleep
    },
    {
      key: "gratitude",
      title: "What are you grateful for today?"
    }
  ];
  const currentQuestion = questions[step];
  const canMoveNext = step === 0
    ? Boolean(selectedMood)
    : step === 1
      ? Boolean(selectedSocialMood)
      : step === 2
        ? Boolean(selectedSleep)
        : true;
  const completeCheckIn = useCallback(
    (shouldSaveGratitude = true) => {
      const mood = selectedMood ?? MOOD_OPTIONS[0];
      const entry = {
        createdAt: new Date().toISOString(),
        gratitude: shouldSaveGratitude ? gratitude.trim() : "",
        id: `${Date.now()}`,
        mood: mood.label,
        sleep: selectedSleep?.label ?? "",
        socialMood: selectedSocialMood?.label ?? ""
      };

      onCompleteCheckIn(entry, mood);
    },
    [gratitude, onCompleteCheckIn, selectedMood, selectedSleep, selectedSocialMood]
  );

  return (
    <View style={styles.todayScreen}>
      <View
        style={[
          styles.todayCanvas,
          {
            paddingBottom: insets.bottom + 8,
            paddingTop: insets.top + 14
          }
        ]}
      >
        <AppTopNav onOpenSettings={onOpenSettings} padded={false} />
        <View style={styles.subscreenBody}>
          <View style={styles.checkInCard}>
            <Text style={styles.checkInKicker}>Daily check-in</Text>
            <View style={styles.checkInProgressRow}>
              {questions.map((question, index) => (
                <View
                  key={question.key}
                  style={[
                    styles.checkInProgressTrack,
                    index <= step && styles.checkInProgressTrackActive
                  ]}
                />
              ))}
            </View>

            <View style={styles.checkInQuestionArea}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                style={styles.checkInQuestion}
              >
                {currentQuestion.title}
              </Text>

              {currentQuestion.key === "gratitude" ? (
                <TextInput
                  accessibilityLabel="What are you grateful for today?"
                  multiline
                  onChangeText={setGratitude}
                  placeholder="Think of three things"
                  placeholderTextColor={TOKENS.colors.textTertiary}
                  selectionColor={TOKENS.colors.inputSelection}
                  style={styles.checkInGratitudeInput}
                  textAlignVertical="top"
                  value={gratitude}
                />
              ) : (
                <View style={styles.checkInOptionsWrap}>
                  {currentQuestion.options.map((option) => (
                    <CheckInOptionPill
                      key={option.label}
                      option={option}
                      onPress={() => currentQuestion.onSelect(option)}
                      selected={currentQuestion.selected?.label === option.label}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.checkInActions}>
              {step > 0 ? (
                <Pressable
                  accessibilityLabel="Previous check-in question"
                  accessibilityRole="button"
                  onPress={() => setStep((current) => Math.max(0, current - 1))}
                  style={({ pressed }) => [styles.checkInTextAction, pressed && styles.pressed]}
                >
                  <Feather name="chevron-left" size={18} color={TOKENS.colors.textSecondary} />
                  <Text style={styles.checkInTextActionLabel}>Previous</Text>
                </Pressable>
              ) : (
                <View style={styles.checkInActionPlaceholder} />
              )}

              {step < questions.length - 1 ? (
                <Pressable
                  accessibilityLabel="Next check-in question"
                  accessibilityRole="button"
                  disabled={!canMoveNext}
                  onPress={() => setStep((current) => Math.min(questions.length - 1, current + 1))}
                  style={({ pressed }) => [
                    styles.checkInTextAction,
                    styles.checkInNextAction,
                    !canMoveNext && styles.checkInActionDisabled,
                    pressed && canMoveNext && styles.checkInNextActionPressed
                  ]}
                >
                  <Text style={styles.checkInNextActionLabel}>Next</Text>
                  <Feather name="chevron-right" size={18} color={TOKENS.colors.textInverse} />
                </Pressable>
              ) : (
                <View style={styles.checkInFinalActions}>
                  <Pressable
                    accessibilityLabel="Skip gratitude and show encouragement"
                    accessibilityRole="button"
                    onPress={() => completeCheckIn(false)}
                    style={({ pressed }) => [styles.checkInSkipButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.checkInSkipButtonText}>Skip</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Save daily check-in and show encouragement"
                    accessibilityRole="button"
                    onPress={() => completeCheckIn(true)}
                    style={({ pressed }) => [styles.checkInSaveButton, pressed && styles.actionButtonPressed]}
                  >
                    <Text style={styles.checkInSaveButtonText}>Save</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.todayActionArea}>
          <AppBottomNav
            onOpenHome={onOpenHome}
            onOpenJournal={onOpenJournal}
            onOpenProfile={onOpenProfile}
            onOpenSaved={onOpenSaved}
            selected="checkIn"
          />
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

function AboutScreen({
  onOpenHome,
  onOpenJournal,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings
}) {
  const { width: aboutScreenWidth } = useWindowDimensions();
  const isNarrowAbout = aboutScreenWidth < 360;

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <ScrollView
          contentContainerStyle={[styles.aboutContent, styles.subscreenContentWithNav]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.aboutIntro}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutSubtitle}>A quiet space for Christ-centered encouragement.</Text>
          </View>

          <View style={styles.aboutFeatureCard}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={TODAY_CARD_BACKGROUND}
              style={styles.aboutFeatureImage}
            />
            <View style={styles.aboutFeatureWash} />
            <View style={styles.aboutFeatureIconBadge}>
              <Ionicons name="book-outline" size={34} color={APP_ACCENT} />
            </View>
            <View style={styles.aboutFeatureCopy}>
              <Text style={styles.aboutFeatureTitle}>What this app is</Text>
              <Text style={styles.aboutFeatureBody}>
                Daily Notes of Grace is a quiet place for Christ-centered encouragement. Each note is
                paired with a King James Version Bible verse to point your heart back to Jesus.
              </Text>
            </View>
          </View>

          <View style={[styles.aboutValueGrid, isNarrowAbout && styles.aboutValueGridStacked]}>
            <AboutValueCard
              body="Short notes anchored in God’s Word."
              iconName="book-outline"
              title="Scripture first"
            />
            <AboutValueCard
              Icon={Feather}
              body="Your notes stay on your device."
              iconName="shield"
              title="Private by design"
            />
          </View>

          <View style={styles.aboutVerseCard}>
            <Text style={styles.aboutQuoteMark}>“</Text>
            <View style={styles.aboutSunGlow} />
            <Text style={styles.aboutVerseText}>
              Come unto me, all ye that labour and are heavy laden, and I will give you rest.
            </Text>
            <Text style={styles.aboutVerseCross}>†</Text>
            <Text style={styles.aboutVerseReference}>Matthew 11:28 (KJV)</Text>
          </View>

          <View style={styles.aboutCareCard}>
            <View style={styles.aboutCareIconBadge}>
              <Ionicons name="heart" size={28} color={APP_ACCENT} />
            </View>
            <View style={styles.aboutCareCopy}>
              <Text style={styles.aboutCareTitle}>A gentle reminder</Text>
              <Text style={styles.aboutCareBody}>
                These notes are for spiritual encouragement and are not a replacement for pastoral,
                medical, or emergency care.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
              selected="notes"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function ToolScreen({
  body,
  onBack,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  title
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <ScrollView
          contentContainerStyle={[styles.toolInfoContent, styles.subscreenContentWithNav]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toolInfoCard}>
            <Text style={styles.toolInfoTitle}>{title}</Text>
            <Text style={styles.toolInfoText}>{body}</Text>
          </View>
        </ScrollView>
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected={null}
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function ThemeChip({ label, onPress, selected }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeChip,
        selected && styles.themeChipSelected,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.themeChipText, selected && styles.themeChipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function FilterGroup({ children, horizontal = false, label }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      {horizontal ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.horizontalChips}
          showsHorizontalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.compactChipRow}>{children}</View>
      )}
    </View>
  );
}

function ExploreResultRow({ item, name, onPress }) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const preview = message.length > 132 ? `${message.slice(0, 132).trim()}...` : message;
  const themes = Array.isArray(item.themes) ? item.themes.slice(0, 3) : [];

  return (
    <Pressable
      accessibilityLabel={`Open ${item.verse_reference}`}
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.exploreResult, pressed && styles.pressed]}
    >
      <Text style={styles.exploreReference}>{item.verse_reference}</Text>
      <Text style={styles.explorePreview}>{preview}</Text>
      <Text style={styles.exploreThemes}>{themes.join(" · ")}</Text>
    </Pressable>
  );
}

function RecentFilterChip({ label, onPress, selected }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.recentFilterChip,
        selected && styles.recentFilterChipSelected,
        pressed && styles.recentFilterChipPressed
      ]}
    >
      <Text style={[styles.recentFilterText, selected && styles.recentFilterTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function RecentHistoryRow({ entry, isSaved, name, onOpen, onToggleSaved }) {
  const { index, item, viewedAt } = entry;
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const themes = Array.isArray(item.themes) ? item.themes.slice(0, 3) : [];

  return (
    <View style={styles.recentCard}>
      <Pressable
        accessibilityLabel={`Open encouragement from ${item.verse_reference}`}
        accessibilityRole="button"
        onPress={() => onOpen(item)}
        style={({ hovered, pressed }) => [
          styles.recentCardPressLayer,
          hovered && styles.recentCardHover,
          pressed && styles.recentCardPressed
        ]}
      >
        <View style={styles.recentCardHeader}>
          <Text numberOfLines={1} style={styles.recentReference}>{item.verse_reference}</Text>
          <Text style={styles.recentTimestamp}>{getRecentTimeLabel(viewedAt, index)}</Text>
        </View>

        <Text numberOfLines={3} style={styles.recentPreview}>{message}</Text>

        <View style={styles.recentTagRow}>
          {themes.map((theme) => (
            <View key={theme} style={styles.recentTag}>
              <Text numberOfLines={1} style={styles.recentTagText}>{theme}</Text>
            </View>
          ))}
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={isSaved ? `Remove ${item.verse_reference} from saved notes` : `Save ${item.verse_reference}`}
        accessibilityRole="button"
        onPress={() => onToggleSaved(item.id)}
        style={({ pressed }) => [styles.recentBookmarkButton, pressed && styles.recentBookmarkPressed]}
      >
        <Ionicons
          name={isSaved ? "bookmark" : "bookmark-outline"}
          size={21}
          color={APP_ACCENT}
        />
      </Pressable>
    </View>
  );
}

function ExploreDetailScreen({
  item,
  isSaved,
  name,
  onBack,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onShare,
  onStartJournal,
  onStartPrayer,
  onToggleSaved
}) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const themes = Array.isArray(item.themes) ? item.themes : [];

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <ScrollView
          contentContainerStyle={[styles.exploreDetailContent, styles.subscreenContentWithNav]}
          showsVerticalScrollIndicator={false}
        >
          <BackHeader backLabel="Results" onBack={onBack} title="Explore" />
          <View style={styles.exploreDetailThemes}>
            {themes.map((theme) => (
              <View key={theme} style={styles.detailThemePill}>
                <Text style={styles.detailThemePillText}>{theme}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.exploreDetailMessage}>{message}</Text>
          <View style={styles.rule} />
          <Text style={styles.verseText}>
            {item.verse_text} <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
          </Text>

          <View style={styles.exploreDetailMeta}>
            <Text style={styles.exploreDetailMetaText}>{item.book}</Text>
            <Text style={styles.exploreDetailMetaText}>{item.testament}</Text>
          </View>

          <View style={styles.exploreDetailActions}>
            <ActionButton icon={<HeartGlyph />} onPress={() => onToggleSaved(item.id)}>
              {isSaved ? "Saved" : "Save"}
            </ActionButton>
            <ActionButton onPress={() => onStartJournal(item)}>Reflect</ActionButton>
            <ActionButton onPress={() => onStartPrayer(item)}>Pray</ActionButton>
            <ActionButton icon={<ShareGlyph />} onPress={() => onShare(item)}>
              Share
            </ActionButton>
          </View>
        </ScrollView>
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          onShare={() => onShare(item)}
          selected={null}
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function ExploreScreen({
  name,
  onBack,
  onOpenItem,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onShare,
  onStartJournal,
  onStartPrayer,
  onToggleSaved,
  savedIds
}) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return encouragements.filter((item) => {
      if (!itemMatchesFilter(item, selectedFilter, name)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return getSearchText(item, name).includes(normalizedQuery);
    });
  }, [name, query, selectedFilter]);

  const listHeader = (
    <View style={styles.exploreHeader}>
      <Text style={styles.exploreTitle}>Browse</Text>
      <View style={styles.exploreSearchPanel}>
        <View style={styles.exploreSearchIcon}>
          <Feather name="search" size={18} color={APP_ACCENT} />
        </View>
      <TextInput
        accessibilityLabel="Explore search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={setQuery}
          placeholder="Search Scripture or encouragement"
        placeholderTextColor={TOKENS.colors.placeholder}
        returnKeyType="search"
        selectionColor={TOKENS.colors.inputSelection}
        style={[styles.searchInput, styles.exploreSearchInput]}
        value={query}
      />
      </View>

      <View style={styles.themeWrap}>
        <ThemeChip
          label="All"
          onPress={() => setSelectedFilter(null)}
          selected={!selectedFilter}
        />
        {EXPLORE_FILTERS.map((filter) => (
          <ThemeChip
            key={filter.label}
            label={filter.label}
            onPress={() => setSelectedFilter(filter)}
            selected={selectedFilter?.label === filter.label}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <FlatList
          ListEmptyComponent={
            <View style={styles.emptyExplore}>
              <Text style={styles.emptySavedText}>No encouragements found.</Text>
            </View>
          }
          ListHeaderComponent={
            listHeader
          }
          contentContainerStyle={[styles.exploreList, styles.subscreenContentWithNav]}
          data={filteredItems}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item }) => (
            <ExploreResultRow item={item} name={name} onPress={onOpenItem} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected={null}
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function RecentScreen({
  name,
  onBack,
  onOpenItem,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onShare,
  onStartJournal,
  onStartPrayer,
  onToggleSaved,
  savedIds,
  seenHistory,
  seenIds
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const safeSavedIds = savedIds instanceof Set ? savedIds : new Set();
  const safeSeenIds = seenIds instanceof Set ? seenIds : new Set();
  const safeSeenHistory = seenHistory && typeof seenHistory === "object" ? seenHistory : {};
  const seenIdOrder = [...safeSeenIds];
  const recentEntries = seenIdOrder
    .map((id, legacyIndex) => {
      const item = getEncouragementById(id);

      if (!item) {
        return null;
      }

      return {
        item,
        legacyIndex,
        viewedAt: safeSeenHistory[id] ?? null
      };
    })
    .filter(Boolean)
    .sort((first, second) => {
      const firstTime = Date.parse(first.viewedAt);
      const secondTime = Date.parse(second.viewedAt);

      if (!Number.isNaN(firstTime) && !Number.isNaN(secondTime)) {
        return secondTime - firstTime;
      }

      if (!Number.isNaN(firstTime)) {
        return -1;
      }

      if (!Number.isNaN(secondTime)) {
        return 1;
      }

      return second.legacyIndex - first.legacyIndex;
    })
    .map((entry, index) => ({ ...entry, index }));
  const filteredEntries = recentEntries.filter((entry) => (
    recentEntryMatchesFilter(entry, activeFilter) && (!showSavedOnly || safeSavedIds.has(entry.item.id))
  ));
  const filterOptions = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" }
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <FlatList
          ListEmptyComponent={
            <View style={styles.recentEmptyCard}>
              <View style={styles.recentEmptyIcon}>
                <Ionicons name="book-outline" size={26} color={APP_ACCENT} />
              </View>
              <Text style={styles.recentEmptyTitle}>
                {recentEntries.length ? "No notes match this filter." : "No recent encouragements yet."}
              </Text>
              <Text style={styles.recentEmptyBody}>
                {recentEntries.length
                  ? "Try All or turn off saved-only filtering."
                  : "Start with today’s encouragement and your reading history will appear here."}
              </Text>
              {!recentEntries.length ? (
                <Pressable
                  accessibilityLabel="Begin today's encouragement"
                  accessibilityRole="button"
                  onPress={onOpenHome}
                  style={({ pressed }) => [styles.recentEmptyButton, pressed && styles.actionButtonPressed]}
                >
                  <Text style={styles.recentEmptyButtonText}>Begin today’s encouragement</Text>
                </Pressable>
              ) : null}
            </View>
          }
          ListHeaderComponent={
            <>
              <View style={styles.recentHeader}>
                <View style={styles.recentTitleRow}>
                  <View style={styles.recentTitleCopy}>
                    <Text style={styles.recentTitle}>Recently Seen</Text>
                    <Text style={styles.recentSubtitle}>
                      Encouragements you’ve read recently.{"\n"}Return to what builds you up in Christ.
                    </Text>
                  </View>
                  <View style={styles.recentHistoryIcon}>
                    <Feather name="clock" size={22} color={APP_ACCENT} />
                  </View>
                </View>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.recentFilterRow}
                  showsHorizontalScrollIndicator={false}
                >
                  {filterOptions.map((filter) => (
                    <RecentFilterChip
                      key={filter.key}
                      label={filter.label}
                      onPress={() => setActiveFilter(filter.key)}
                      selected={activeFilter === filter.key}
                    />
                  ))}
                  <Pressable
                    accessibilityLabel={showSavedOnly ? "Show all recently seen notes" : "Show saved recently seen notes only"}
                    accessibilityRole="button"
                    accessibilityState={showSavedOnly ? { selected: true } : undefined}
                    onPress={() => setShowSavedOnly((current) => !current)}
                    style={({ pressed }) => [
                      styles.recentFilterIconButton,
                      showSavedOnly && styles.recentFilterIconButtonSelected,
                      pressed && styles.recentFilterChipPressed
                    ]}
                  >
                    <Feather
                      name="sliders"
                      size={17}
                      color={showSavedOnly ? TOKENS.colors.textInverse : TOKENS.colors.accent}
                    />
                  </Pressable>
                </ScrollView>
              </View>
            </>
          }
          contentContainerStyle={[styles.recentList, styles.subscreenContentWithNav]}
          data={filteredEntries}
          keyExtractor={(entry) => `${entry.item.id}`}
          renderItem={({ item }) => (
            <RecentHistoryRow
              entry={item}
              isSaved={safeSavedIds.has(item.item.id)}
              name={name}
              onOpen={onOpenItem}
              onToggleSaved={onToggleSaved}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="notes"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function JournalEntryRow({ entry, onPress }) {
  const linkedItem = getEncouragementById(entry.linkedItemId);
  const title = entry.title || "Untitled reflection";
  const preview = entry.body.length > 144 ? `${entry.body.slice(0, 144).trim()}...` : entry.body;
  const marker = linkedItem?.verse_reference ?? entry.promptLabel;

  return (
    <Pressable
      accessibilityLabel={`Open reflection ${title}`}
      accessibilityRole="button"
      onPress={() => onPress(entry)}
      style={({ pressed }) => [styles.journalEntry, pressed && styles.pressed]}
    >
      <View style={styles.savedItemHeader}>
        <Text style={styles.exploreReference}>{getJournalDateLabel(entry.updatedAt)}</Text>
        {marker ? <Text style={styles.favoriteMark}>{marker}</Text> : null}
      </View>
      <Text style={styles.journalEntryTitle}>{title}</Text>
      {preview ? <Text style={styles.journalPreview}>{preview}</Text> : null}
    </Pressable>
  );
}

function LinkedEncouragementCard({ item, name, onPress, selected }) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const preview = message.length > 116 ? `${message.slice(0, 116).trim()}...` : message;

  return (
    <Pressable
      accessibilityLabel={`${selected ? "Selected" : "Link"} ${item.verse_reference}`}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.linkedResult,
        selected && styles.linkedResultSelected,
        pressed && styles.pressed
      ]}
    >
      <Text style={styles.exploreReference}>{item.verse_reference}</Text>
      <Text style={styles.linkedPreview}>{preview}</Text>
    </Pressable>
  );
}

function JournalEditorScreen({
  entry,
  initialLinkedItem,
  initialPrompt,
  name,
  onBack,
  onDeleteEntry,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onSaveEntry
}) {
  const [title, setTitle] = useState(entry?.title ?? initialPrompt?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? initialPrompt?.body ?? "");
  const [linkedItemId, setLinkedItemId] = useState(entry?.linkedItemId ?? initialLinkedItem?.id ?? null);
  const [linkQuery, setLinkQuery] = useState("");
  const [promptLabel, setPromptLabel] = useState(entry?.promptLabel ?? initialPrompt?.label ?? "");
  const linkedItem = getEncouragementById(linkedItemId);

  const linkResults = useMemo(() => {
    const normalizedQuery = linkQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return encouragements
      .filter((item) => getSearchText(item, name).includes(normalizedQuery))
      .slice(0, 8);
  }, [linkQuery, name]);

  const applyPrompt = useCallback((prompt) => {
    setPromptLabel(prompt.label);

    if (!title.trim()) {
      setTitle(prompt.title);
    }

    if (!body.trim()) {
      setBody(prompt.body);
    } else if (!body.includes(prompt.body)) {
      setBody(`${body.trim()}\n\n${prompt.body}`);
    }
  }, [body, title]);

  const saveEntry = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle && !trimmedBody) {
      Alert.alert("Write a reflection first", "Add a title or a note before saving this journal entry.");
      return;
    }

    const now = new Date().toISOString();

    const didSave = await onSaveEntry({
      body: trimmedBody,
      createdAt: entry?.createdAt ?? now,
      id: entry?.id ?? `${Date.now()}`,
      linkedItemId,
      promptLabel,
      title: trimmedTitle,
      updatedAt: now
    });

    if (didSave) {
      onBack();
    }
  }, [body, entry?.createdAt, entry?.id, linkedItemId, onBack, onSaveEntry, promptLabel, title]);

  const confirmDelete = useCallback(() => {
    if (!entry) {
      onBack();
      return;
    }

    Alert.alert(
      "Delete reflection?",
      "This journal entry will be removed from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const didDelete = await onDeleteEntry(entry.id);

            if (didDelete) {
              onBack();
            }
          }
        }
      ]
    );
  }, [entry, onBack, onDeleteEntry]);

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.savedDetailShell}
      >
        <ScrollView
          contentContainerStyle={[styles.journalEditorContent, styles.subscreenContentWithNav]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackHeader onBack={onBack} title="Journal" />
          <View style={styles.promptBox}>
            <Text style={styles.profileSectionTitle}>Reflection prompts</Text>
            <View style={styles.themeWrap}>
              {JOURNAL_PROMPTS.map((prompt) => (
                <ThemeChip
                  key={prompt.label}
                  label={prompt.label}
                  onPress={() => applyPrompt(prompt)}
                  selected={promptLabel === prompt.label}
                />
              ))}
            </View>
          </View>

          <TextInput
            accessibilityLabel="Reflection title"
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={TOKENS.colors.placeholder}
            selectionColor={TOKENS.colors.inputSelection}
            style={styles.journalTitleInput}
            value={title}
          />

          <TextInput
            accessibilityLabel="Reflection body"
            multiline
            onChangeText={setBody}
            placeholder="Write your reflection..."
            placeholderTextColor={TOKENS.colors.placeholder}
            selectionColor={TOKENS.colors.inputSelection}
            style={styles.journalBodyInput}
            textAlignVertical="top"
            value={body}
          />

          <View style={styles.journalLinkBox}>
            <Text style={styles.profileSectionTitle}>Linked encouragement</Text>
            {linkedItem ? (
              <View style={styles.linkedSelected}>
                <Text style={styles.exploreReference}>{linkedItem.verse_reference}</Text>
                <Text style={styles.linkedPreview}>
                  {renderTemplate(linkedItem.encouragement_template, name, linkedItem.fallback_name)}
                </Text>
                <Pressable
                  accessibilityLabel="Remove linked encouragement"
                  accessibilityRole="button"
                  onPress={() => setLinkedItemId(null)}
                  style={({ pressed }) => [styles.removeSavedButton, pressed && styles.pressed]}
                >
                  <Text style={styles.removeSavedButtonText}>Remove Link</Text>
                </Pressable>
              </View>
            ) : null}

            <TextInput
              accessibilityLabel="Search encouragements to link"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={setLinkQuery}
              placeholder="Search verse, theme, or phrase"
              placeholderTextColor={TOKENS.colors.placeholder}
              returnKeyType="search"
              selectionColor={TOKENS.colors.inputSelection}
              style={styles.searchInput}
              value={linkQuery}
            />

            {linkResults.length > 0 ? (
              <View style={styles.linkResults}>
                {linkResults.map((item) => (
                  <LinkedEncouragementCard
                    item={item}
                    key={item.id}
                    name={name}
                    onPress={(nextItem) => {
                      setLinkedItemId(nextItem.id);
                      setLinkQuery("");
                    }}
                    selected={item.id === linkedItemId}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.exploreDetailActions}>
            {entry ? (
              <Pressable
                accessibilityLabel="Delete reflection"
                accessibilityRole="button"
                onPress={confirmDelete}
                style={({ pressed }) => [styles.removeSavedButton, pressed && styles.pressed]}
              >
                <Text style={styles.removeSavedButtonText}>Delete</Text>
              </Pressable>
            ) : null}
            <ActionButton onPress={saveEntry}>Save Reflection</ActionButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="notes"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function JournalScreen({
  entries,
  initialLinkedItem,
  initialPrompt,
  name,
  onBack,
  onDeleteEntry,
  onInitialPromptHandled,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onSaveEntry
}) {
  const [query, setQuery] = useState("");
  const [editorEntry, setEditorEntry] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [quickStartLinkedItem, setQuickStartLinkedItem] = useState(null);
  const [quickStartPrompt, setQuickStartPrompt] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    if (!initialPrompt) {
      return;
    }

    setEditorEntry(null);
    setQuickStartLinkedItem(initialLinkedItem ?? null);
    setQuickStartPrompt(initialPrompt);
    setIsCreating(true);
    onInitialPromptHandled();
  }, [initialLinkedItem, initialPrompt, onInitialPromptHandled]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (selectedFilter === "linked" && !entry.linkedItemId) {
        return false;
      }

      if (selectedFilter === "unlinked" && entry.linkedItemId) {
        return false;
      }

      if (selectedFilter === "prompts" && !entry.promptLabel) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const linkedItem = getEncouragementById(entry.linkedItemId);
      const linkedText = linkedItem ? getSearchText(linkedItem, name) : "";

      return [
        entry.title,
        entry.body,
        entry.promptLabel,
        getJournalDateLabel(entry.updatedAt),
        linkedText
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [entries, name, query, selectedFilter]);

  if (isCreating || editorEntry) {
    return (
      <JournalEditorScreen
        entry={editorEntry}
        initialLinkedItem={editorEntry ? null : quickStartLinkedItem}
        initialPrompt={editorEntry ? null : quickStartPrompt}
        name={name}
        onBack={() => {
          setEditorEntry(null);
          setIsCreating(false);
          setQuickStartLinkedItem(null);
          setQuickStartPrompt(null);
        }}
        onDeleteEntry={onDeleteEntry}
        onOpenHome={onOpenHome}
        onOpenJournal={onOpenJournal}
        onOpenProfile={onOpenProfile}
        onOpenSaved={onOpenSaved}
        onOpenSettings={onOpenSettings}
        onSaveEntry={onSaveEntry}
      />
    );
  }

  const listHeader = (
    <View style={styles.toolListHeader}>
      <View style={styles.toolTitleRow}>
        <View style={styles.toolTitleBlock}>
          <Text style={styles.toolEyebrow}>Private reflections</Text>
          <Text style={styles.toolPageTitle}>Journal</Text>
        </View>
        <ActionButton
          onPress={() => {
            setQuickStartPrompt(null);
            setQuickStartLinkedItem(null);
            setIsCreating(true);
          }}
        >
          New
        </ActionButton>
      </View>

      <View style={styles.controlsPanel}>
        <TextInput
          accessibilityLabel="Search reflections"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search reflections"
          placeholderTextColor={TOKENS.colors.placeholder}
          returnKeyType="search"
          selectionColor={TOKENS.colors.inputSelection}
          style={styles.searchInput}
          value={query}
        />
        <FilterGroup label="View">
          <ThemeChip label="All" onPress={() => setSelectedFilter("all")} selected={selectedFilter === "all"} />
          <ThemeChip label="Linked" onPress={() => setSelectedFilter("linked")} selected={selectedFilter === "linked"} />
          <ThemeChip label="Unlinked" onPress={() => setSelectedFilter("unlinked")} selected={selectedFilter === "unlinked"} />
          <ThemeChip label="Prompts" onPress={() => setSelectedFilter("prompts")} selected={selectedFilter === "prompts"} />
        </FilterGroup>
      </View>

      <Text style={styles.resultCount}>
        {filteredEntries.length} journal entr{filteredEntries.length === 1 ? "y" : "ies"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <FlatList
          ListEmptyComponent={
            <View style={styles.emptyExplore}>
              <Text style={styles.emptySavedText}>No reflections yet.</Text>
              <Text style={styles.toolText}>Create a private entry and connect it to a verse or encouragement.</Text>
            </View>
          }
          ListHeaderComponent={
            listHeader
          }
          contentContainerStyle={[styles.savedList, styles.subscreenContentWithNav]}
          data={filteredEntries}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalEntryRow entry={item} onPress={setEditorEntry} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="notes"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function PrayerRequestRow({ onPress, request }) {
  const preview = request.body.length > 132 ? `${request.body.slice(0, 132).trim()}...` : request.body;
  const isAnswered = Boolean(request.answeredAt);
  const category = request.category ?? "Personal";

  return (
    <Pressable
      accessibilityLabel={`Open prayer request ${request.title || "Untitled prayer"}`}
      accessibilityRole="button"
      onPress={() => onPress(request)}
      style={({ pressed }) => [styles.prayerRequest, pressed && styles.pressed]}
    >
      <View style={styles.savedItemHeader}>
        <Text style={styles.exploreReference}>
          {isAnswered ? `Answered ${getJournalDateLabel(request.answeredAt)}` : `Added ${getJournalDateLabel(request.createdAt)}`}
        </Text>
        <Text style={isAnswered ? styles.answeredMark : styles.favoriteMark}>
          {isAnswered ? "Answered" : category}
        </Text>
      </View>
      <Text style={styles.journalEntryTitle}>{request.title || "Untitled prayer"}</Text>
      {preview ? <Text style={styles.journalPreview}>{preview}</Text> : null}
      <Text style={styles.prayerMeta}>{formatPrayerCount(request.prayerCount)}</Text>
      {request.lastPrayedAt ? (
        <Text style={styles.prayerMeta}>Last prayed {getJournalDateLabel(request.lastPrayedAt)}</Text>
      ) : null}
    </Pressable>
  );
}

function PrayerEditorScreen({
  initialLinkedItem,
  initialPrompt,
  onBack,
  onDeleteRequest,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onSaveRequest,
  request
}) {
  const [title, setTitle] = useState(request?.title ?? initialPrompt?.title ?? "");
  const [body, setBody] = useState(request?.body ?? initialPrompt?.body ?? "");
  const [category, setCategory] = useState(
    request?.category ?? (initialPrompt?.label === "Answered" ? "Gratitude" : "Personal")
  );
  const [linkedItemId, setLinkedItemId] = useState(request?.linkedItemId ?? initialLinkedItem?.id ?? null);
  const linkedItem = getEncouragementById(linkedItemId);

  const applyPrompt = useCallback((prompt) => {
    if (prompt.label === "Answered") {
      setCategory("Gratitude");
    }

    if (!title.trim()) {
      setTitle(prompt.title);
    }

    if (!body.trim()) {
      setBody(prompt.body);
    } else if (!body.includes(prompt.body)) {
      setBody(`${body.trim()}\n\n${prompt.body}`);
    }
  }, [body, title]);

  const saveRequest = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle && !trimmedBody) {
      Alert.alert("Write a prayer first", "Add a title or a note before saving this prayer request.");
      return;
    }

    const now = new Date().toISOString();

    const didSave = await onSaveRequest({
      answeredAt: request?.answeredAt ?? null,
      body: trimmedBody,
      category,
      createdAt: request?.createdAt ?? now,
      id: request?.id ?? `${Date.now()}`,
      lastPrayedAt: request?.lastPrayedAt ?? null,
      linkedItemId,
      prayerCount: request?.prayerCount ?? 0,
      title: trimmedTitle,
      updatedAt: now
    });

    if (didSave) {
      onBack();
    }
  }, [body, category, linkedItemId, onBack, onSaveRequest, request, title]);

  const confirmDelete = useCallback(() => {
    if (!request) {
      onBack();
      return;
    }

    Alert.alert(
      "Delete prayer request?",
      "This prayer request will be removed from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const didDelete = await onDeleteRequest(request.id);

            if (didDelete) {
              onBack();
            }
          }
        }
      ]
    );
  }, [onBack, onDeleteRequest, request]);

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.savedDetailShell}
      >
        <ScrollView
          contentContainerStyle={[styles.journalEditorContent, styles.subscreenContentWithNav]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackHeader onBack={onBack} title="Prayer" />
          <View style={styles.promptBox}>
            <Text style={styles.profileSectionTitle}>Prayer prompts</Text>
            <View style={styles.themeWrap}>
              {PRAYER_PROMPTS.map((prompt) => (
                <ThemeChip
                  key={prompt.label}
                  label={prompt.label}
                  onPress={() => applyPrompt(prompt)}
                  selected={title === prompt.title}
                />
              ))}
            </View>
          </View>

          <View style={styles.promptBox}>
            <Text style={styles.profileSectionTitle}>Category</Text>
            <View style={styles.themeWrap}>
              {PRAYER_CATEGORIES.map((nextCategory) => (
                <ThemeChip
                  key={nextCategory}
                  label={nextCategory}
                  onPress={() => setCategory(nextCategory)}
                  selected={category === nextCategory}
                />
              ))}
            </View>
          </View>

          <TextInput
            accessibilityLabel="Prayer title"
            onChangeText={setTitle}
            placeholder="Prayer title"
            placeholderTextColor={TOKENS.colors.placeholder}
            selectionColor={TOKENS.colors.inputSelection}
            style={styles.journalTitleInput}
            value={title}
          />

          <TextInput
            accessibilityLabel="Prayer body"
            multiline
            onChangeText={setBody}
            placeholder="Write the request, person, situation, or answer you are waiting for..."
            placeholderTextColor={TOKENS.colors.placeholder}
            selectionColor={TOKENS.colors.inputSelection}
            style={styles.journalBodyInput}
            textAlignVertical="top"
            value={body}
          />

          {linkedItem ? (
            <View style={styles.journalLinkBox}>
              <Text style={styles.profileSectionTitle}>Linked encouragement</Text>
              <View style={styles.linkedSelected}>
                <Text style={styles.exploreReference}>{linkedItem.verse_reference}</Text>
                <Text style={styles.linkedPreview}>
                  {renderTemplate(linkedItem.encouragement_template, "", linkedItem.fallback_name)}
                </Text>
                <Pressable
                  accessibilityLabel="Remove linked encouragement"
                  accessibilityRole="button"
                  onPress={() => setLinkedItemId(null)}
                  style={({ pressed }) => [styles.removeSavedButton, pressed && styles.pressed]}
                >
                  <Text style={styles.removeSavedButtonText}>Remove Link</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.exploreDetailActions}>
            {request ? (
              <Pressable
                accessibilityLabel="Delete prayer request"
                accessibilityRole="button"
                onPress={confirmDelete}
                style={({ pressed }) => [styles.removeSavedButton, pressed && styles.pressed]}
              >
                <Text style={styles.removeSavedButtonText}>Delete</Text>
              </Pressable>
            ) : null}
            <ActionButton onPress={saveRequest}>Save Prayer</ActionButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="pray"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function PrayerDetailScreen({
  onBack,
  onDeleteRequest,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onMarkPrayed,
  onSaveRequest,
  onToggleAnswered,
  request
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isAnswered = Boolean(request.answeredAt);
  const category = request.category ?? "Personal";
  const linkedItem = getEncouragementById(request.linkedItemId);

  if (isEditing) {
    return (
      <PrayerEditorScreen
        onBack={() => setIsEditing(false)}
        onDeleteRequest={onDeleteRequest}
        onOpenHome={onOpenHome}
        onOpenJournal={onOpenJournal}
        onOpenProfile={onOpenProfile}
        onOpenSaved={onOpenSaved}
        onOpenSettings={onOpenSettings}
        onSaveRequest={onSaveRequest}
        request={request}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <ScrollView
          contentContainerStyle={[styles.prayerDetailContent, styles.subscreenContentWithNav]}
          showsVerticalScrollIndicator={false}
        >
          <BackHeader onBack={onBack} title="Prayer" />
          <View style={styles.savedItemHeader}>
            <Text style={styles.exploreReference}>{getJournalDateLabel(request.updatedAt)}</Text>
            <Text style={isAnswered ? styles.answeredMark : styles.favoriteMark}>
              {isAnswered ? "Answered" : category}
            </Text>
          </View>

          <Text style={styles.exploreDetailMessage}>{request.title || "Untitled prayer"}</Text>
          {request.body ? <Text style={styles.prayerBody}>{request.body}</Text> : null}

          {linkedItem ? (
            <View style={styles.linkedSelected}>
              <Text style={styles.exploreReference}>{linkedItem.verse_reference}</Text>
              <Text style={styles.linkedPreview}>{linkedItem.verse_text}</Text>
            </View>
          ) : null}

          <View style={styles.prayerStats}>
            <View style={styles.homeStat}>
              <Text style={styles.homeStatValue}>{request.prayerCount}</Text>
              <Text style={styles.homeStatLabel}>Times Prayed</Text>
            </View>
            <View style={styles.homeStat}>
              <Text style={styles.prayerStatDate}>
                {category}
              </Text>
              <Text style={styles.homeStatLabel}>Category</Text>
            </View>
          </View>

          <Text style={styles.prayerMeta}>
            {request.lastPrayedAt ? `Last prayed ${getJournalDateLabel(request.lastPrayedAt)}` : "Not prayed yet"}
          </Text>

          {isAnswered && request.answeredAt ? (
            <Text style={styles.prayerMeta}>Answered on {getJournalDateLabel(request.answeredAt)}</Text>
          ) : null}

          <View style={styles.prayerActionGrid}>
            <ActionButton onPress={() => onMarkPrayed(request.id)}>Prayed Today</ActionButton>
            <ActionButton onPress={() => onToggleAnswered(request.id)}>
              {isAnswered ? "Mark Active" : "Mark Answered"}
            </ActionButton>
            <Pressable
              accessibilityLabel="Edit prayer"
              accessibilityRole="button"
              onPress={() => setIsEditing(true)}
              style={({ pressed }) => [styles.secondaryPillButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryPillButtonText}>Edit Prayer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="pray"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function PrayerScreen({
  initialLinkedItem,
  initialPrompt,
  onBack,
  onDeleteRequest,
  onInitialPromptHandled,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onMarkPrayed,
  onSaveRequest,
  onToggleAnswered,
  requests
}) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("active");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [quickStartLinkedItem, setQuickStartLinkedItem] = useState(null);
  const [quickStartPrompt, setQuickStartPrompt] = useState(null);

  useEffect(() => {
    if (!initialPrompt) {
      return;
    }

    setSelectedRequest(null);
    setQuickStartLinkedItem(initialLinkedItem ?? null);
    setQuickStartPrompt(initialPrompt);
    setIsCreating(true);
    onInitialPromptHandled();
  }, [initialLinkedItem, initialPrompt, onInitialPromptHandled]);

  const currentSelectedRequest = selectedRequest
    ? requests.find((request) => request.id === selectedRequest.id)
    : null;

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      if (selectedFilter === "active" && request.answeredAt) {
        return false;
      }

      if (selectedFilter === "answered" && !request.answeredAt) {
        return false;
      }

      const category = request.category ?? "Personal";
      const linkedItem = getEncouragementById(request.linkedItemId);
      const linkedText = linkedItem ? getSearchText(linkedItem, "") : "";

      if (selectedCategory !== "all" && category !== selectedCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        request.title,
        request.body,
        category,
        linkedText,
        getJournalDateLabel(request.createdAt),
        getJournalDateLabel(request.updatedAt),
        request.answeredAt ? getJournalDateLabel(request.answeredAt) : ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, requests, selectedCategory, selectedFilter]);

  if (isCreating) {
    return (
      <PrayerEditorScreen
        initialLinkedItem={quickStartLinkedItem}
        initialPrompt={quickStartPrompt}
        onBack={() => {
          setIsCreating(false);
          setQuickStartLinkedItem(null);
          setQuickStartPrompt(null);
        }}
        onDeleteRequest={onDeleteRequest}
        onOpenHome={onOpenHome}
        onOpenJournal={onOpenJournal}
        onOpenProfile={onOpenProfile}
        onOpenSaved={onOpenSaved}
        onOpenSettings={onOpenSettings}
        onSaveRequest={onSaveRequest}
      />
    );
  }

  if (currentSelectedRequest) {
    return (
      <PrayerDetailScreen
        onBack={() => setSelectedRequest(null)}
        onDeleteRequest={async (id) => {
          await onDeleteRequest(id);
          setSelectedRequest(null);
        }}
        onOpenHome={onOpenHome}
        onOpenJournal={onOpenJournal}
        onOpenProfile={onOpenProfile}
        onOpenSaved={onOpenSaved}
        onOpenSettings={onOpenSettings}
        onMarkPrayed={onMarkPrayed}
        onSaveRequest={onSaveRequest}
        onToggleAnswered={onToggleAnswered}
        request={currentSelectedRequest}
      />
    );
  }

  const listHeader = (
    <View style={styles.toolListHeader}>
      <View style={styles.toolTitleRow}>
        <View style={styles.toolTitleBlock}>
          <Text style={styles.toolEyebrow}>Requests and answers</Text>
          <Text style={styles.toolPageTitle}>Prayer List</Text>
        </View>
        <ActionButton
          onPress={() => {
            setQuickStartPrompt(null);
            setQuickStartLinkedItem(null);
            setIsCreating(true);
          }}
        >
          New
        </ActionButton>
      </View>

      <View style={styles.controlsPanel}>
        <TextInput
          accessibilityLabel="Search prayer requests"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search prayer requests"
          placeholderTextColor={TOKENS.colors.placeholder}
          returnKeyType="search"
          selectionColor={TOKENS.colors.inputSelection}
          style={styles.searchInput}
          value={query}
        />

        <FilterGroup label="Status">
          <ThemeChip label="Active" onPress={() => setSelectedFilter("active")} selected={selectedFilter === "active"} />
          <ThemeChip label="Answered" onPress={() => setSelectedFilter("answered")} selected={selectedFilter === "answered"} />
          <ThemeChip label="All" onPress={() => setSelectedFilter("all")} selected={selectedFilter === "all"} />
        </FilterGroup>

        <FilterGroup horizontal label="Category">
          <ThemeChip label="All" onPress={() => setSelectedCategory("all")} selected={selectedCategory === "all"} />
          {PRAYER_CATEGORIES.map((category) => (
            <ThemeChip
              key={category}
              label={category}
              onPress={() => setSelectedCategory(category)}
              selected={selectedCategory === category}
            />
          ))}
        </FilterGroup>
      </View>

      <Text style={styles.resultCount}>
        {filteredRequests.length} prayer request{filteredRequests.length === 1 ? "" : "s"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        <FlatList
          ListEmptyComponent={
            <View style={styles.emptyExplore}>
              <Text style={styles.emptySavedText}>No prayer requests here yet.</Text>
              <Text style={styles.toolText}>Add a request, mark when you prayed, and keep answers visible.</Text>
            </View>
          }
          ListHeaderComponent={
            listHeader
          }
          contentContainerStyle={[styles.savedList, styles.subscreenContentWithNav]}
          data={filteredRequests}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PrayerRequestRow onPress={setSelectedRequest} request={item} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="pray"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function TodayFeedCard({
  height,
  isSaved,
  item,
  name,
  onOpenSettings,
  screenHeight,
  onToggleSaved
}) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const textPreset = getTodayTextPreset(message, item.verse_text, screenHeight);

  return (
    <View style={[styles.todayCardPage, { height }]}>
      <View style={styles.todayArticle}>
        <View style={styles.todayArticleHeader}>
          <View style={styles.todayVerseIcon}>
            <Feather name="sun" size={24} color={APP_ACCENT} />
          </View>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            numberOfLines={1}
            style={styles.todayReference}
          >
            {item.verse_reference}
          </Text>
          <Pressable
            accessibilityLabel={isSaved ? "Remove from saved" : "Save encouragement"}
            accessibilityRole="button"
            onPress={() => onToggleSaved(item.id)}
            style={({ pressed }) => [styles.todayIconButton, pressed && styles.pressed]}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? TOKENS.colors.accent : TOKENS.colors.text}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="More options"
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={({ pressed }) => [styles.todayIconButton, pressed && styles.pressed]}
          >
            <Feather name="more-horizontal" size={24} color={TOKENS.colors.text} />
          </Pressable>
        </View>

        <View style={styles.todayMessageSlot}>
          <Text
            style={[
              styles.todayMessage,
              {
                fontSize: textPreset.messageFontSize,
                lineHeight: textPreset.messageLineHeight
              }
            ]}
          >
            {message}
          </Text>
        </View>

        <View style={styles.todayScripture}>
          <Text style={styles.todayScriptureLabel}>Scripture</Text>
          <Text
            style={[
              styles.todayVerse,
              {
                fontSize: textPreset.verseFontSize,
                lineHeight: textPreset.verseLineHeight
              }
            ]}
          >
            {item.verse_text}
          </Text>
          <Text style={styles.todayScriptureReference}>{item.verse_reference}, KJV</Text>
        </View>
      </View>
    </View>
  );
}

function EncouragementNoteButton({
  accessibilityLabel,
  height,
  icon,
  label,
  onPress,
  selected = false,
  variant = "secondary"
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const isPrimary = variant === "primary";
  const isInteractive = hovered || pressed;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.encouragementButton,
        styles.encouragementButtonInteractive,
        isPrimary ? styles.encouragementButtonPrimary : styles.encouragementButtonSecondary,
        selected && styles.encouragementButtonSelected,
        { height },
        hovered && styles.encouragementButtonHover,
        pressed && styles.encouragementButtonPressed
      ]}
    >
      <View
        style={[
          styles.encouragementButtonIconWrap,
          isInteractive && styles.encouragementButtonIconWrapActive,
          isPrimary && isInteractive && styles.encouragementButtonIconWrapPrimaryActive
        ]}
      >
        <Feather
          name={icon}
          size={isPrimary ? 16 : 15}
          color={isPrimary ? TOKENS.colors.textInverse : TOKENS.colors.accent}
          strokeWidth={2.15}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.encouragementButtonText,
          isPrimary && styles.encouragementButtonTextPrimary,
          !isPrimary && styles.encouragementButtonTextSecondary,
          isInteractive && styles.encouragementButtonTextActive
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function EncouragementNoteScreen({
  isSaved = false,
  item,
  name,
  onNext,
  onOpenHome,
  onOpenJournal,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onReflect,
  onShare,
  onToggleSaved,
  selectedTab = "home"
}) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const message = item ? renderTemplate(item.encouragement_template, name, item.fallback_name) : "";
  const displayChunks = useMemo(() => formatEncouragementChunks(message, width), [message, width]);
  const displayMessage = useMemo(() => displayChunks.join(""), [displayChunks]);
  const displayMessageForSizing = useMemo(
    () => `${displayMessage}${" ".repeat(Math.max(0, displayChunks.length - 1) * 34)}`,
    [displayChunks.length, displayMessage]
  );
  const notePreset = getEncouragementNotePreset(displayMessageForSizing, item?.verse_text ?? "", height, width);
  const tokens = useMemo(() => getEncouragementTokens(displayMessage), [displayMessage]);
  const scriptureIntroText = "Consider what the Bible says:";
  const scriptureIntroTokens = useMemo(() => getEncouragementTokens(scriptureIntroText), []);
  const scriptureWordTokens = useMemo(() => getWordRevealTokens(item?.verse_text ?? ""), [item?.verse_text]);
  const [visibleTokenCount, setVisibleTokenCount] = useState(0);
  const [visibleScriptureIntroCount, setVisibleScriptureIntroCount] = useState(0);
  const [visibleScriptureWordCount, setVisibleScriptureWordCount] = useState(0);
  const [showScriptureReference, setShowScriptureReference] = useState(false);
  const [showScripture, setShowScripture] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [canSkipReveal, setCanSkipReveal] = useState(false);
  const currentCharacterOpacity = useRef(new Animated.Value(1)).current;
  const currentScriptureIntroCharacterOpacity = useRef(new Animated.Value(1)).current;
  const visibleMessage = useMemo(
    () => getVisibleEncouragementChunks(displayChunks, visibleTokenCount),
    [displayChunks, visibleTokenCount]
  );
  const visibleScriptureIntro = useMemo(
    () => getVisibleEncouragementText(scriptureIntroTokens, visibleScriptureIntroCount),
    [scriptureIntroTokens, visibleScriptureIntroCount]
  );
  const visibleScriptureText = useMemo(
    () => getVisibleEncouragementText(scriptureWordTokens, visibleScriptureWordCount),
    [scriptureWordTokens, visibleScriptureWordCount]
  );
  const scriptureIntroComplete = visibleScriptureIntroCount >= scriptureIntroTokens.length;
  const showScriptureCard = showScripture && scriptureIntroComplete;
  const scriptureTextComplete = visibleScriptureWordCount >= scriptureWordTokens.length;
  const visibleScriptureIntroBody = visibleScriptureIntro.slice(0, -1);
  const visibleScriptureIntroLastCharacter = visibleScriptureIntro.slice(-1);
  const lastVisibleChunkIndex = visibleMessage.reduce(
    (lastIndex, chunk, index) => (chunk.length > 0 ? index : lastIndex),
    -1
  );

  useEffect(() => {
    setVisibleTokenCount(0);
    setVisibleScriptureIntroCount(0);
    setVisibleScriptureWordCount(0);
    setShowScriptureReference(false);
    setShowScripture(false);
    setShowActions(false);
    setCanSkipReveal(false);

    const timer = setTimeout(() => {
      setCanSkipReveal(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [item?.id]);

  useEffect(() => {
    if (!item) {
      return undefined;
    }

    if (visibleTokenCount < tokens.length) {
      const timer = setTimeout(() => {
        setVisibleTokenCount((current) => Math.min(current + 1, tokens.length));
      }, getEncouragementRevealDelay(tokens, visibleTokenCount));

      return () => clearTimeout(timer);
    }

    if (!showScripture) {
      const timer = setTimeout(() => {
        setShowScripture(true);
      }, 680);

      return () => clearTimeout(timer);
    }

    if (visibleScriptureIntroCount < scriptureIntroTokens.length) {
      const timer = setTimeout(() => {
        setVisibleScriptureIntroCount((current) =>
          Math.min(current + 1, scriptureIntroTokens.length)
        );
      }, getEncouragementRevealDelay(scriptureIntroTokens, visibleScriptureIntroCount));

      return () => clearTimeout(timer);
    }

    if (visibleScriptureWordCount < scriptureWordTokens.length) {
      const timer = setTimeout(() => {
        setVisibleScriptureWordCount((current) =>
          Math.min(current + 1, scriptureWordTokens.length)
        );
      }, 95);

      return () => clearTimeout(timer);
    }

    if (!showScriptureReference) {
      const timer = setTimeout(() => {
        setShowScriptureReference(true);
      }, 260);

      return () => clearTimeout(timer);
    }

    if (!showActions) {
      const timer = setTimeout(() => {
        setShowActions(true);
      }, 320);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [
    item,
    scriptureIntroTokens,
    scriptureWordTokens,
    showActions,
    showScripture,
    showScriptureReference,
    tokens,
    visibleScriptureIntroCount,
    visibleScriptureWordCount,
    visibleTokenCount
  ]);

  useEffect(() => {
    if (visibleTokenCount <= 0 || visibleTokenCount >= tokens.length) {
      currentCharacterOpacity.setValue(1);
      return;
    }

    currentCharacterOpacity.setValue(0.12);
    Animated.timing(currentCharacterOpacity, {
      duration: 170,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: Platform.OS !== "web"
    }).start();
  }, [currentCharacterOpacity, tokens.length, visibleTokenCount]);

  useEffect(() => {
    if (
      !showScripture ||
      visibleScriptureIntroCount <= 0 ||
      visibleScriptureIntroCount >= scriptureIntroTokens.length
    ) {
      currentScriptureIntroCharacterOpacity.setValue(1);
      return;
    }

    currentScriptureIntroCharacterOpacity.setValue(0.12);
    Animated.timing(currentScriptureIntroCharacterOpacity, {
      duration: 170,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: Platform.OS !== "web"
    }).start();
  }, [
    currentScriptureIntroCharacterOpacity,
    scriptureIntroTokens.length,
    showScripture,
    visibleScriptureIntroCount
  ]);

  const revealNext = useCallback(() => {
    if (!canSkipReveal) {
      return;
    }

    if (visibleTokenCount < tokens.length) {
      setVisibleTokenCount(tokens.length);
      return;
    }

    if (!showScripture) {
      setShowScripture(true);
      return;
    }

    if (!scriptureIntroComplete) {
      setVisibleScriptureIntroCount(scriptureIntroTokens.length);
      return;
    }

    if (!scriptureTextComplete) {
      setVisibleScriptureWordCount(scriptureWordTokens.length);
      return;
    }

    if (!showScriptureReference) {
      setShowScriptureReference(true);
      return;
    }

    if (!showActions) {
      setShowActions(true);
    }
  }, [
    canSkipReveal,
    scriptureIntroComplete,
    scriptureIntroTokens.length,
    scriptureTextComplete,
    scriptureWordTokens.length,
    showActions,
    showScripture,
    showScriptureReference,
    tokens.length,
    visibleTokenCount
  ]);

  if (!item) {
    return null;
  }

  return (
    <View style={styles.todayScreen}>
      <View
        style={[
          styles.todayCanvas,
          {
            paddingBottom: insets.bottom + 8,
            paddingTop: insets.top + 14
          }
        ]}
      >
        <AppTopNav onOpenSettings={onOpenSettings} padded={false} />
        <View style={styles.encouragementNoteBody}>
          <View style={[styles.encouragementNotePanel, { padding: notePreset.panelPadding }]}>
            <View pointerEvents="none" style={styles.encouragementPanelGlowTop} />
            <View pointerEvents="none" style={styles.encouragementPanelGlowBottom} />
            <Pressable
              accessibilityLabel="Reveal encouragement"
              accessibilityRole="button"
              onPress={revealNext}
              style={styles.encouragementRevealArea}
            >
              <View style={styles.encouragementTypewriterWrap}>
                <View
                  accessibilityElementsHidden
                  aria-hidden
                  importantForAccessibility="no-hide-descendants"
                  style={[
                    styles.encouragementMessageGhost,
                    { gap: notePreset.messageChunkGap }
                  ]}
                >
                  {displayChunks.map((chunk, index) => (
                    <Text
                      key={`ghost-${index}-${chunk}`}
                      style={[
                        styles.encouragementLine,
                        {
                          fontSize: notePreset.messageFontSize,
                          lineHeight: notePreset.messageLineHeight
                        }
                      ]}
                    >
                      {chunk}
                    </Text>
                  ))}
                </View>
                <View style={[styles.encouragementMessageLive, { gap: notePreset.messageChunkGap }]}>
                  {visibleMessage.map((chunk, index) => {
                    if (!chunk) {
                      return null;
                    }

                    const isLastVisibleChunk = index === lastVisibleChunkIndex;
                    const chunkBody = isLastVisibleChunk ? chunk.slice(0, -1) : chunk;
                    const chunkLastCharacter = isLastVisibleChunk ? chunk.slice(-1) : "";

                    return (
                      <Text
                        key={`live-${index}`}
                        style={[
                          styles.encouragementLine,
                          {
                            fontSize: notePreset.messageFontSize,
                            lineHeight: notePreset.messageLineHeight
                          }
                        ]}
                      >
                        {chunkBody}
                        {chunkLastCharacter ? (
                          <Animated.Text style={{ opacity: currentCharacterOpacity }}>
                            {chunkLastCharacter}
                          </Animated.Text>
                        ) : null}
                      </Text>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.encouragementContentSpacer, { minHeight: notePreset.contentSpacerMinHeight }]} />

              <View
                style={[
                  styles.encouragementScriptureBlock,
                  { marginTop: notePreset.scriptureBlockMarginTop }
                ]}
              >
                <FadeReveal delay={140} visible={showScripture}>
                  <View style={styles.encouragementScriptureIntroWrap}>
                    <Text
                      accessibilityElementsHidden
                      aria-hidden
                      importantForAccessibility="no-hide-descendants"
                      style={[
                        styles.encouragementScriptureIntro,
                        styles.encouragementScriptureIntroGhost,
                        {
                          fontSize: notePreset.scriptureIntroFontSize,
                          lineHeight: Math.round(notePreset.scriptureIntroFontSize + 4)
                        }
                      ]}
                    >
                      {scriptureIntroText}
                    </Text>
                    <Text
                    style={[
                      styles.encouragementScriptureIntro,
                        styles.encouragementScriptureIntroLive,
                      {
                        fontSize: notePreset.scriptureIntroFontSize,
                        lineHeight: Math.round(notePreset.scriptureIntroFontSize + 4)
                      }
                    ]}
                  >
                      {visibleScriptureIntroBody}
                      {visibleScriptureIntroLastCharacter ? (
                        <Animated.Text style={{ opacity: currentScriptureIntroCharacterOpacity }}>
                          {visibleScriptureIntroLastCharacter}
                        </Animated.Text>
                      ) : null}
                    </Text>
                  </View>
                </FadeReveal>
                <FadeReveal delay={180} visible={showScriptureCard}>
                  <View
                    style={[
                      styles.encouragementScriptureCard,
                      {
                        paddingHorizontal: notePreset.scriptureCardPaddingHorizontal,
                        paddingVertical: notePreset.scriptureCardPaddingVertical
                      }
                    ]}
                  >
                    <FadeReveal delay={80} visible={showScriptureCard}>
                      <View style={styles.encouragementScriptureTextWrap}>
                        <Text
                          accessibilityElementsHidden
                          aria-hidden
                          importantForAccessibility="no-hide-descendants"
                          style={[
                            styles.encouragementScriptureText,
                            styles.encouragementScriptureTextGhost,
                            {
                              fontSize: notePreset.scriptureFontSize,
                              lineHeight: notePreset.scriptureLineHeight
                            }
                          ]}
                        >
                          {item.verse_text}
                        </Text>
                        <Text
                          style={[
                            styles.encouragementScriptureText,
                            styles.encouragementScriptureTextLive,
                            {
                              fontSize: notePreset.scriptureFontSize,
                              lineHeight: notePreset.scriptureLineHeight
                            }
                          ]}
                        >
                          {visibleScriptureText}
                        </Text>
                      </View>
                    </FadeReveal>
                    <FadeReveal delay={120} visible={showScriptureReference}>
                      <Text
                        style={[
                          styles.encouragementScriptureReference,
                          {
                            fontSize: notePreset.scriptureReferenceFontSize,
                            lineHeight: notePreset.scriptureReferenceLineHeight,
                            marginTop: notePreset.scriptureReferenceMarginTop
                          }
                        ]}
                      >
                        {item.verse_reference}, KJV
                      </Text>
                    </FadeReveal>
                  </View>
                </FadeReveal>
              </View>
            </Pressable>

            <View
              style={[
                styles.encouragementActions,
                {
                  gap: notePreset.actionGap,
                  marginTop: notePreset.actionMarginTop
                }
              ]}
            >
              <View style={[styles.encouragementActionRow, { gap: notePreset.actionGap }]}>
                <FadeReveal delay={60} visible={showActions} style={{ flex: 1 }}>
                  <EncouragementNoteButton
                    accessibilityLabel={isSaved ? "Remove saved encouragement" : "Save encouragement"}
                    height={notePreset.actionButtonHeight}
                    icon="bookmark"
                    label={isSaved ? "Saved" : "Save"}
                    onPress={() => onToggleSaved(item.id)}
                    selected={isSaved}
                  />
                </FadeReveal>
                <FadeReveal delay={150} visible={showActions} style={{ flex: 1 }}>
                  <EncouragementNoteButton
                    accessibilityLabel="Reflect on encouragement"
                    height={notePreset.actionButtonHeight}
                    icon="edit-3"
                    label="Reflect"
                    onPress={() => onReflect(item)}
                  />
                </FadeReveal>
                <FadeReveal delay={240} visible={showActions} style={{ flex: 1 }}>
                  <EncouragementNoteButton
                    accessibilityLabel="Share encouragement"
                    height={notePreset.actionButtonHeight}
                    icon="send"
                    label="Share"
                    onPress={() => onShare(item)}
                  />
                </FadeReveal>
              </View>

              <FadeReveal delay={340} visible={showActions}>
                <EncouragementNoteButton
                  accessibilityLabel="Next encouragement"
                  height={notePreset.nextButtonHeight}
                  icon="arrow-right"
                  label="Next encouragement"
                  onPress={onNext}
                  variant="primary"
                />
              </FadeReveal>
            </View>
          </View>
        </View>

        <View style={styles.todayActionArea}>
          <AppBottomNav
            onOpenHome={onOpenHome}
            onOpenJournal={onOpenJournal}
            onOpenProfile={onOpenProfile}
            onOpenSaved={onOpenSaved}
            selected={selectedTab}
          />
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

function FeedScreen({
  initialSeenHistory = {},
  initialSeenIds = new Set(),
  moodFilter = null,
  name,
  onOpenHome,
  onOpenSettings,
  onShare,
  onSeenHistoryChange = () => {},
  onSeenIdsChange,
  onStartJournal,
  onStartPrayer,
  onToggleSaved,
  savedIds = new Set()
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const todayItems = useMemo(() => getMoodFeedItems(name, moodFilter), [moodFilter, name]);
  const [listHeight, setListHeight] = useState(0);
  const [queue, setQueue] = useState(() => getUnseenQueue(initialSeenIds, todayItems));
  const [activeItemId, setActiveItemId] = useState(() => queue[0]?.id ?? null);
  const safeSavedIds = savedIds instanceof Set ? savedIds : new Set();
  const seenIdsRef = useRef(new Set(initialSeenIds));
  const seenHistoryRef = useRef({ ...(initialSeenHistory ?? {}) });
  const isAppendingRef = useRef(false);
  const queueIdsRef = useRef(new Set(queue.map((item) => item.id)));

  useEffect(() => {
    seenHistoryRef.current = { ...(initialSeenHistory ?? {}) };
  }, [initialSeenHistory]);

  useEffect(() => {
    const nextQueue = getUnseenQueue(seenIdsRef.current, todayItems);
    queueIdsRef.current = new Set(nextQueue.map((item) => item.id));
    setQueue(nextQueue);
  }, [todayItems]);

  useEffect(() => {
    if (!queue.some((item) => item.id === activeItemId)) {
      setActiveItemId(queue[0]?.id ?? null);
    }
  }, [activeItemId, queue]);

  const persistSeenData = useCallback(
    async (nextSeenIds, nextSeenHistory) => {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.seenIds, JSON.stringify([...nextSeenIds])],
        [STORAGE_KEYS.seenHistory, JSON.stringify(nextSeenHistory)]
      ]);
      onSeenIdsChange(new Set(nextSeenIds));
      onSeenHistoryChange({ ...nextSeenHistory });
    },
    [onSeenHistoryChange, onSeenIdsChange]
  );

  const markSeen = useCallback(
    (ids) => {
      const nextSeenIds = new Set(seenIdsRef.current);
      const nextSeenHistory = { ...seenHistoryRef.current };
      const now = Date.now();
      const timestamp = new Date(now).toISOString();
      let changed = false;

      ids.forEach((id) => {
        if (!Number.isInteger(id)) {
          return;
        }

        if (!nextSeenIds.has(id)) {
          nextSeenIds.add(id);
          changed = true;
        }

        const previousTime = Date.parse(nextSeenHistory[id]);

        if (Number.isNaN(previousTime) || now - previousTime > 60 * 1000) {
          nextSeenHistory[id] = timestamp;
          changed = true;
        }
      });

      if (!changed) {
        return;
      }

      seenIdsRef.current = nextSeenIds;
      seenHistoryRef.current = nextSeenHistory;
      persistSeenData(nextSeenIds, nextSeenHistory).catch(() => {});
    },
    [persistSeenData]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const ids = viewableItems.map((entry) => entry.item?.id).filter(Boolean);
    const activeEntry = [...viewableItems]
      .filter((entry) => entry.item)
      .sort((first, second) => first.index - second.index)[0];

    if (activeEntry?.item?.id) {
      setActiveItemId(activeEntry.item.id);
    }

    markSeen(ids);
  }).current;

  const appendMore = useCallback(async () => {
    if (isAppendingRef.current) {
      return;
    }

    isAppendingRef.current = true;

    try {
      let nextItems = todayItems.filter(
        (item) => !seenIdsRef.current.has(item.id) && !queueIdsRef.current.has(item.id)
      );

      if (nextItems.length === 0) {
        seenIdsRef.current = new Set();
        seenHistoryRef.current = {};
        queueIdsRef.current = new Set(queue.map((item) => item.id));
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.seenIds, "[]"],
          [STORAGE_KEYS.seenHistory, "{}"]
        ]);
        onSeenIdsChange(new Set());
        onSeenHistoryChange({});

        nextItems = todayItems.filter((item) => !queueIdsRef.current.has(item.id));

        if (nextItems.length === 0) {
          queueIdsRef.current = new Set();
          nextItems = todayItems;
        }
      }

      const shuffled = shuffle(nextItems);
      shuffled.forEach((item) => queueIdsRef.current.add(item.id));
      setQueue((current) => [...current, ...shuffled]);
    } catch {
      showStorageError("refresh your encouragement queue");
    } finally {
      isAppendingRef.current = false;
    }
  }, [onSeenHistoryChange, onSeenIdsChange, queue, todayItems]);

  const activeItem = useMemo(
    () => queue.find((item) => item.id === activeItemId) ?? queue[0] ?? null,
    [activeItemId, queue]
  );

  const updateActiveFromOffset = useCallback(
    (event) => {
      if (!listHeight) {
        return;
      }

      const nextIndex = Math.round(event.nativeEvent.contentOffset.y / listHeight);
      const nextItem = queue[nextIndex];

      if (nextItem) {
        setActiveItemId(nextItem.id);
      }
    },
    [listHeight, queue]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TodayFeedCard
        height={listHeight || height}
        isSaved={safeSavedIds.has(item.id)}
        item={item}
        name={name}
        onOpenSettings={onOpenSettings}
        screenHeight={height}
        onToggleSaved={onToggleSaved}
      />
    ),
    [height, listHeight, name, onOpenSettings, onToggleSaved, safeSavedIds]
  );

  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, []);

  return (
    <View style={styles.todayScreen}>
      <View
        style={[
          styles.todayCanvas,
          {
            paddingBottom: insets.bottom + 8,
            paddingTop: insets.top + 14
          }
        ]}
      >
        <View style={styles.todayTopArea}>
          <View style={styles.todayTopBar}>
            <View style={styles.todayLogoWrap}>
              <Wordmark compact />
            </View>
            <Pressable
              accessibilityLabel="Open menu"
              accessibilityRole="button"
              onPress={onOpenSettings}
              style={({ pressed }) => [styles.todayMenuButton, pressed && styles.pressed]}
            >
              <Feather name="menu" size={19} color={APP_ACCENT} />
            </Pressable>
          </View>
        </View>

        <View
          onLayout={(event) => setListHeight(Math.max(1, event.nativeEvent.layout.height))}
          style={styles.todayReadingArea}
        >
          <FlatList
            bounces={false}
            decelerationRate="fast"
            disableIntervalMomentum
            ListEmptyComponent={EmptyFeed}
            contentContainerStyle={styles.feedContent}
            data={queue}
            initialNumToRender={3}
            keyExtractor={keyExtractor}
            maxToRenderPerBatch={4}
            onEndReached={appendMore}
            onEndReachedThreshold={0.85}
            onMomentumScrollEnd={updateActiveFromOffset}
            onViewableItemsChanged={onViewableItemsChanged}
            pagingEnabled
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={listHeight || undefined}
            style={styles.todayCardList}
            viewabilityConfig={viewabilityConfig}
            windowSize={5}
          />
        </View>

        <View style={styles.todayActionArea}>
          {activeItem ? (
            <DailyActionNav
              isSaved={safeSavedIds.has(activeItem.id)}
              item={activeItem}
              onOpenHome={onOpenHome}
              onShare={onShare}
              onStartJournal={onStartJournal}
              onStartPrayer={onStartPrayer}
              onToggleSaved={onToggleSaved}
            />
          ) : null}
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

function BackHeader({ backLabel, title, onBack }) {
  return (
    <View style={styles.subscreenHeader}>
      <Pressable
        accessibilityLabel={backLabel ? `Back to ${backLabel}` : `Back from ${title}`}
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          backLabel && styles.backButtonWithLabel,
          pressed && styles.pressed
        ]}
      >
        <Feather name="arrow-left" size={22} color={APP_ACCENT} />
        {backLabel ? <Text style={styles.backButtonText}>{backLabel}</Text> : null}
      </Pressable>
      <Text style={styles.subscreenTitle}>{title}</Text>
    </View>
  );
}

function SavedLibraryRow({ favorite, item, name, note, onPress }) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const preview = message.length > 128 ? `${message.slice(0, 128).trim()}...` : message;
  const themes = Array.isArray(item.themes) ? item.themes.slice(0, 3) : [];

  return (
    <Pressable
      accessibilityLabel={`Open saved note ${item.verse_reference}`}
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.savedItem, pressed && styles.pressed]}
    >
      <View style={styles.savedItemHeader}>
        <Text style={styles.exploreReference}>{item.verse_reference}</Text>
        {favorite ? <Text style={styles.favoriteMark}>Favorite</Text> : null}
      </View>
      <Text style={styles.savedMessage}>{preview}</Text>
      <Text style={styles.exploreThemes}>{themes.join(" · ")}</Text>
      {note ? <Text style={styles.savedNotePreview}>Note: {note}</Text> : null}
    </Pressable>
  );
}

function SavedDetailScreen({
  favorite,
  item,
  name,
  note,
  onBack,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onOpenItem,
  onSavePersonalNote,
  onShare,
  onStartJournal,
  onStartPrayer,
  onToggleFavorite,
  onToggleSaved
}) {
  const [draftNote, setDraftNote] = useState(note);
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const themes = Array.isArray(item.themes) ? item.themes : [];

  useEffect(() => {
    setDraftNote(note);
  }, [item.id, note]);

  const removeSavedItem = useCallback(() => {
    Alert.alert(
      "Remove saved note?",
      "This encouragement will be removed from your saved library.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const didRemove = await onToggleSaved(item.id);

            if (didRemove) {
              onBack();
            }
          }
        }
      ]
    );
  }, [item.id, onBack, onToggleSaved]);

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.savedDetailShell}
      >
        <ScrollView
          contentContainerStyle={[styles.exploreDetailContent, styles.subscreenContentWithNav]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackHeader backLabel="My Notes" onBack={onBack} title="Saved Note" />
          <View style={styles.exploreDetailThemes}>
            {themes.map((theme) => (
              <View key={theme} style={styles.detailThemePill}>
                <Text style={styles.detailThemePillText}>{theme}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.exploreDetailMessage}>{message}</Text>
          <View style={styles.rule} />
          <Text style={styles.verseText}>
            {item.verse_text} <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
          </Text>

          <View style={styles.savedPersonalBox}>
            <Text style={styles.profileSectionTitle}>Personal note</Text>
            <TextInput
              accessibilityLabel="Personal saved note"
              multiline
              onChangeText={setDraftNote}
              placeholder="Write what you want to remember..."
              placeholderTextColor={TOKENS.colors.placeholder}
              selectionColor={TOKENS.colors.inputSelection}
              style={styles.savedNoteInput}
              textAlignVertical="top"
              value={draftNote}
            />
            <Pressable
              accessibilityLabel="Save personal note"
              accessibilityRole="button"
              onPress={() => onSavePersonalNote(item.id, draftNote)}
              style={({ pressed }) => [styles.saveNameButton, pressed && styles.pressed]}
            >
              <Text style={styles.saveNameButtonLabel}>Save Note</Text>
            </Pressable>
          </View>

          <View style={styles.exploreDetailActions}>
            <ActionButton onPress={() => onToggleFavorite(item.id)}>
              {favorite ? "Favorited" : "Favorite"}
            </ActionButton>
            <ActionButton onPress={() => onStartJournal(item)}>Reflect</ActionButton>
            <ActionButton onPress={() => onStartPrayer(item)}>Pray</ActionButton>
            <ActionButton icon={<ShareGlyph />} onPress={() => onShare(item)}>
              Share
            </ActionButton>
          </View>

          <Pressable
            accessibilityLabel="Remove from saved"
            accessibilityRole="button"
            onPress={removeSavedItem}
            style={({ pressed }) => [styles.removeSavedButton, pressed && styles.pressed]}
          >
            <Text style={styles.removeSavedButtonText}>Remove from Saved</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          onShare={() => onShare(item)}
          selected="notes"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function SavedScreen({
  favoriteSavedIds,
  name,
  onBack,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onOpenItem,
  onSavePersonalNote,
  onShare,
  onStartJournal,
  onStartPrayer,
  onToggleFavorite,
  onToggleSaved,
  savedIds,
  savedNotes
}) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const safeSavedIds = savedIds instanceof Set ? savedIds : new Set();
  const safeFavoriteIds = favoriteSavedIds instanceof Set ? favoriteSavedIds : new Set();
  const savedItems = encouragements.filter((item) => safeSavedIds.has(item.id));

  const filteredSavedItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return savedItems.filter((item) => {
      const note = savedNotes[item.id] ?? "";

      if (favoriteOnly && !safeFavoriteIds.has(item.id)) {
        return false;
      }

      if (!itemMatchesFilter(item, selectedFilter, name)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return `${getSearchText(item, name)} ${note}`.toLowerCase().includes(normalizedQuery);
    });
  }, [favoriteOnly, name, query, safeFavoriteIds, savedItems, savedNotes, selectedFilter]);

  const listHeader = (
    <View style={styles.exploreHeader}>
      <View style={styles.myNotesHeaderRow}>
        <Text style={[styles.exploreTitle, styles.myNotesTitle]}>My Notes</Text>
        <Pressable
          accessibilityLabel="Open Journal"
          accessibilityRole="button"
          onPress={onOpenJournal}
          style={({ hovered, pressed }) => [
            styles.myNotesJournalButton,
            hovered && styles.myNotesJournalButtonHover,
            pressed && styles.myNotesJournalButtonPressed
          ]}
        >
          <Feather name="edit-3" size={15} color={TOKENS.colors.accent} />
          <Text style={styles.myNotesJournalButtonText}>Journal</Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Search saved notes"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder="Search saved notes"
        placeholderTextColor={TOKENS.colors.placeholder}
        returnKeyType="search"
        selectionColor={TOKENS.colors.inputSelection}
        style={styles.searchInput}
        value={query}
      />

      <View style={styles.themeWrap}>
        <ThemeChip
          label="All"
          onPress={() => {
            setSelectedFilter(null);
            setFavoriteOnly(false);
          }}
          selected={!selectedFilter && !favoriteOnly}
        />
        <ThemeChip label="Favorites" onPress={() => setFavoriteOnly(!favoriteOnly)} selected={favoriteOnly} />
        {EXPLORE_FILTERS.slice(0, 8).map((filter) => (
          <ThemeChip
            key={filter.label}
            label={filter.label}
            onPress={() => setSelectedFilter(filter)}
            selected={selectedFilter?.label === filter.label}
          />
        ))}
      </View>

      <Text style={styles.resultCount}>
        {filteredSavedItems.length} saved encouragement{filteredSavedItems.length === 1 ? "" : "s"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <View style={styles.subscreenBody}>
        {savedItems.length === 0 ? (
          <ScrollView
            contentContainerStyle={[styles.savedList, styles.subscreenContentWithNav]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.toolListHeader}>
              <Text style={styles.toolPageTitle}>My Notes</Text>
            </View>
            <View style={styles.emptySaved}>
              <Text style={styles.emptySavedText}>No saved encouragements yet.</Text>
              <Text style={styles.emptySavedHint}>Saved encouragements and journal reflections will live here.</Text>
              <Pressable
                accessibilityLabel="Open Journal"
                accessibilityRole="button"
                onPress={onOpenJournal}
                style={({ hovered, pressed }) => [
                  styles.recentEmptyButton,
                  hovered && styles.actionButtonHover,
                  pressed && styles.actionButtonPressed
                ]}
              >
                <Text style={styles.recentEmptyButtonText}>Open Journal</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ListEmptyComponent={
              <View style={styles.emptyExplore}>
                <Text style={styles.emptySavedText}>No saved encouragements match.</Text>
                <Text style={styles.toolText}>Try another search or filter.</Text>
              </View>
            }
            ListHeaderComponent={
              listHeader
            }
            contentContainerStyle={[styles.savedList, styles.subscreenContentWithNav]}
            data={filteredSavedItems}
            keyExtractor={(item) => `${item.id}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <SavedLibraryRow
                favorite={safeFavoriteIds.has(item.id)}
                item={item}
                name={name}
                note={savedNotes[item.id] ?? ""}
                onPress={onOpenItem}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          onShare={savedItems[0] ? () => onShare(savedItems[0]) : undefined}
          selected="notes"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function ProfileInfoCard({ body, Icon = Feather, iconName, title }) {
  return (
    <View style={styles.profileInfoCard}>
      <View style={styles.profileInfoIconBadge}>
        <Icon name={iconName} size={22} color={APP_ACCENT} />
      </View>
      <View style={styles.profileInfoCopy}>
        <Text style={styles.profileCardTitle}>{title}</Text>
        <Text style={styles.profileCardBody}>{body}</Text>
      </View>
    </View>
  );
}

function ProfileMiniInfoCard({ body, compact = false, Icon = Feather, iconName, title }) {
  return (
    <View style={[styles.profileMiniCard, compact && styles.profileMiniCardCompact]}>
      <View style={[styles.profileMiniIconBadge, compact && styles.profileMiniIconBadgeCompact]}>
        <Icon name={iconName} size={19} color={APP_ACCENT} />
      </View>
      <Text style={[styles.profileMiniTitle, compact && styles.profileMiniTitleCompact]}>{title}</Text>
      <Text style={[styles.profileMiniBody, compact && styles.profileMiniBodyCompact]}>{body}</Text>
    </View>
  );
}

function ProfileManageRow({ Icon = Feather, compact = false, danger = false, iconName, label, onPress, showDivider = false }) {
  return (
    <>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ hovered, pressed }) => [
          styles.profileManageRow,
          compact && styles.profileManageRowCompact,
          hovered && styles.profileManageRowHover,
          pressed && styles.profileManageRowPressed
        ]}
      >
        <View style={styles.profileManageIcon}>
          <Icon name={iconName} size={18} color={APP_ACCENT} />
        </View>
        <Text style={[styles.profileManageLabel, compact && styles.profileManageLabelCompact, danger && styles.profileManageLabelDanger]}>{label}</Text>
        <Feather name="chevron-right" size={18} color={TOKENS.colors.textTertiary} />
      </Pressable>
      {showDivider ? <View style={styles.profileManageDivider} /> : null}
    </>
  );
}

function ProfileReminderCard({
  compact = false,
  enabled,
  hour,
  onSetHour,
  onToggle
}) {
  return (
    <View style={[styles.profileReminderCard, compact && styles.profileReminderCardCompact]}>
      <View style={styles.profileReminderTopRow}>
        <View style={styles.profileReminderIconBadge}>
          <Feather name="bell" size={20} color={APP_ACCENT} />
        </View>
        <View style={styles.profileReminderCopy}>
          <Text style={styles.profileReminderTitle}>Daily reminder</Text>
          <Text style={styles.profileReminderBody}>
            {enabled
              ? `A quiet prompt is set for ${formatReminderHour(hour)}.`
              : "Get a gentle prompt to check in and read encouragement."}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={enabled ? "Turn off daily reminder" : "Turn on daily reminder"}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.profileReminderSwitch,
            enabled && styles.profileReminderSwitchEnabled,
            pressed && styles.profileReminderSwitchPressed
          ]}
        >
          <View style={[styles.profileReminderSwitchKnob, enabled && styles.profileReminderSwitchKnobEnabled]} />
        </Pressable>
      </View>

      <View style={styles.profileReminderTimes}>
        {REMINDER_HOURS.map((reminderHour) => {
          const selected = enabled && `${reminderHour}` === `${hour}`;

          return (
            <Pressable
              accessibilityLabel={`Set daily reminder for ${formatReminderHour(reminderHour)}`}
              accessibilityRole="button"
              accessibilityState={selected ? { selected: true } : undefined}
              key={reminderHour}
              onPress={() => onSetHour(reminderHour)}
              style={({ hovered, pressed }) => [
                styles.profileReminderTime,
                hovered && styles.profileReminderTimeHover,
                selected && styles.profileReminderTimeSelected,
                pressed && styles.profileReminderTimePressed
              ]}
            >
              <Text style={[styles.profileReminderTimeText, selected && styles.profileReminderTimeTextSelected]}>
                {formatReminderHour(reminderHour).replace(":00 ", "")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SettingsScreen({
  name,
  notificationHour,
  onBack,
  onClearSaved,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onResetSeen,
  onSave,
  onSetNotificationHour,
  onToggleNotification
}) {
  const { width: profileScreenWidth } = useWindowDimensions();
  const [draftName, setDraftName] = useState(name);
  const [nameFocused, setNameFocused] = useState(false);
  const profileIsNarrow = profileScreenWidth < 360;

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.settingsContent}
      >
        <View style={styles.subscreenBody}>
          <ScrollView
            contentContainerStyle={[styles.settingsBody, styles.subscreenContentWithNav]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileTitleBlock}>
              <Text style={styles.settingsTitle}>Profile</Text>
              <Text style={styles.settingsSubtitle}>Personal details and quiet app care.</Text>
            </View>

            <View style={styles.profileNameCard}>
              <View style={styles.profileNameGlow} />
              <View style={styles.profileNameAura} />
              <View style={styles.profileAvatarBadge}>
                <Feather name="user" size={31} color={APP_ACCENT} />
              </View>
              <View style={styles.profileNameForm}>
                <Text style={styles.profileNameLabel}>Your name</Text>
                <TextInput
                  accessibilityLabel="Profile name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  cursorColor={TOKENS.colors.accentHover}
                  onBlur={() => setNameFocused(false)}
                  onChangeText={setDraftName}
                  onFocus={() => setNameFocused(true)}
                  placeholder="Christian"
                  placeholderTextColor={TOKENS.colors.placeholder}
                  returnKeyType="done"
                  selectionColor={TOKENS.colors.inputSelection}
                  style={[styles.profileNameInput, nameFocused && styles.profileNameInputFocused]}
                  value={draftName}
                />
                <Pressable
                  accessibilityLabel="Save profile name"
                  accessibilityRole="button"
                  onPress={() => onSave(draftName)}
                  style={({ pressed }) => [styles.profileSaveButton, pressed && styles.profileSaveButtonPressed]}
                >
                  <Text style={styles.profileSaveButtonLabel}>Save</Text>
                </Pressable>
              </View>
            </View>

            <ProfileInfoCard
              Icon={Ionicons}
              body="A quiet space for Christ-centered encouragement. Each note is paired with a King James Version verse to point your heart back to Jesus."
              iconName="book-outline"
              title="About this app"
            />

            <View style={styles.profileMiniGrid}>
              <ProfileMiniInfoCard
                body="Everything stays on your device. No tracking."
                compact={profileIsNarrow}
                iconName="shield"
                title="Private by design"
              />
              <ProfileMiniInfoCard
                Icon={Ionicons}
                body="Spiritual encouragement is not a replacement for professional care."
                compact={profileIsNarrow}
                iconName="heart-outline"
                title="Care note"
              />
            </View>

            <ProfileReminderCard
              compact={profileIsNarrow}
              enabled={notificationHour !== null}
              hour={notificationHour}
              onSetHour={onSetNotificationHour}
              onToggle={onToggleNotification}
            />

            <View style={[styles.profileManageCard, profileIsNarrow && styles.profileManageCardCompact]}>
              <Text style={styles.profileManageTitle}>Manage notes</Text>
              <View style={styles.profileManageRows}>
                <ProfileManageRow
                  compact={profileIsNarrow}
                  iconName="refresh-cw"
                  label="Reset Seen Notes"
                  onPress={onResetSeen}
                  showDivider
                />
                <ProfileManageRow
                  compact={profileIsNarrow}
                  danger
                  iconName="trash-2"
                  label="Clear Saved Notes"
                  onPress={onClearSaved}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          selected="profile"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function SharePreviewScreen({
  item,
  onBack,
  onOpenHome,
  onOpenJournal,
  onOpenPrayer,
  onOpenProfile,
  onOpenSaved,
  onOpenSettings,
  onShare
}) {
  const [recipientName, setRecipientName] = useState("");
  const message = item ? shareTextFor(item, recipientName) : "";

  if (!item) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopNav onOpenSettings={onOpenSettings} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.shareContent}
      >
        <View style={styles.subscreenBody}>
          <View style={styles.shareBody}>
            <View style={styles.shareHeaderBlock}>
              <BackHeader onBack={onBack} title="Share" />
              <Text style={styles.shareEyebrow}>Send encouragement</Text>
              <Text style={styles.shareTitle}>Prepare a note</Text>
              <Text style={styles.shareSubtitle}>
                Add a name if you want the message to feel personal.
              </Text>
            </View>

            <View style={styles.shareRecipientCard}>
              <View style={styles.shareRecipientIcon}>
                <Feather name="user" size={18} color={APP_ACCENT} />
              </View>
              <View style={styles.shareRecipientCopy}>
                <Text style={styles.shareRecipientLabel}>Recipient</Text>
                <TextInput
                  accessibilityLabel="Share recipient name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  cursorColor={TOKENS.colors.accentHover}
                  onChangeText={setRecipientName}
                  placeholder="Leave blank for Christian"
                  placeholderTextColor={TOKENS.colors.placeholder}
                  returnKeyType="done"
                  selectionColor={TOKENS.colors.inputSelection}
                  style={styles.shareRecipientInput}
                  value={recipientName}
                />
              </View>
            </View>

            <View style={styles.sharePreviewCard}>
              <View style={styles.sharePreviewTopRow}>
                <View style={styles.sharePreviewIcon}>
                  <Feather name="send" size={17} color={APP_ACCENT} />
                </View>
                <View style={styles.sharePreviewTitleBlock}>
                  <Text style={styles.sharePreviewLabel}>Preview message</Text>
                  <Text numberOfLines={1} style={styles.sharePreviewReference}>
                    {item.verse_reference}, KJV
                  </Text>
                </View>
              </View>
              <ScrollView
                contentContainerStyle={styles.sharePreviewScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sharePreviewText}>{message}</Text>
              </ScrollView>
            </View>

            <Pressable
              accessibilityLabel="Share encouragement"
              accessibilityRole="button"
              onPress={() => onShare(message)}
              style={({ pressed }) => [styles.sharePrimaryButton, pressed && styles.sharePrimaryButtonPressed]}
            >
              <Text style={styles.sharePrimaryButtonText}>Share encouragement</Text>
              <Feather name="send" size={18} color={TOKENS.colors.textInverse} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.subscreenActionArea}>
        <AppBottomNav
          onOpenHome={onOpenHome}
          onOpenJournal={onOpenJournal}
          onOpenProfile={onOpenProfile}
          onOpenSaved={onOpenSaved}
          onShare={() => onShare(message)}
          selected="share"
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AppContent() {
  const [isBooting, setIsBooting] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [name, setName] = useState("");
  const [favoriteSavedIds, setFavoriteSavedIds] = useState(new Set());
  const [notificationHour, setNotificationHour] = useState(null);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedNotes, setSavedNotes] = useState({});
  const [seenHistory, setSeenHistory] = useState({});
  const [seenIds, setSeenIds] = useState(new Set());
  const [screen, setScreen] = useState("home");
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEncouragementItem, setSelectedEncouragementItem] = useState(null);
  const [encouragementReturnTab, setEncouragementReturnTab] = useState("home");
  const [shareItem, setShareItem] = useState(null);
  const [shareReturnScreen, setShareReturnScreen] = useState("home");
  const [quickJournalLinkedItem, setQuickJournalLinkedItem] = useState(null);
  const [quickJournalPrompt, setQuickJournalPrompt] = useState(null);
  const [quickPrayerLinkedItem, setQuickPrayerLinkedItem] = useState(null);
  const [quickPrayerPrompt, setQuickPrayerPrompt] = useState(null);
  const menuHostRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const startTime = Date.now();

      try {
        const storedValues = await AsyncStorage.multiGet([
          STORAGE_KEYS.hasOnboarded,
          STORAGE_KEYS.journalEntries,
          STORAGE_KEYS.moodEntries,
          STORAGE_KEYS.name,
          STORAGE_KEYS.notificationHour,
          STORAGE_KEYS.favoriteSavedIds,
          STORAGE_KEYS.prayerRequests,
          STORAGE_KEYS.savedIds,
          STORAGE_KEYS.savedNotes,
          STORAGE_KEYS.seenHistory,
          STORAGE_KEYS.seenIds
        ]);
        const stored = Object.fromEntries(storedValues);
        const remainingSplashMs = Math.max(SPLASH_MS - (Date.now() - startTime), 0);

        await delay(remainingSplashMs);

        if (!isMounted) {
          return;
        }

        setHasOnboarded(stored[STORAGE_KEYS.hasOnboarded] === "true");
        setJournalEntries(parseStoredJournalEntries(stored[STORAGE_KEYS.journalEntries]));
        setMoodEntries(parseStoredMoodEntries(stored[STORAGE_KEYS.moodEntries]));
        setName(stored[STORAGE_KEYS.name] ?? "");
        setNotificationHour(stored[STORAGE_KEYS.notificationHour] ?? null);
        setFavoriteSavedIds(parseStoredIds(stored[STORAGE_KEYS.favoriteSavedIds]));
        setPrayerRequests(parseStoredPrayerRequests(stored[STORAGE_KEYS.prayerRequests]));
        setSavedIds(parseStoredIds(stored[STORAGE_KEYS.savedIds]));
        setSavedNotes(parseStoredNotes(stored[STORAGE_KEYS.savedNotes]));
        setSeenHistory(parseSeenHistory(stored[STORAGE_KEYS.seenHistory]));
        setSeenIds(parseSeenIds(stored[STORAGE_KEYS.seenIds]));
      } catch {
        if (isMounted) {
          setHasOnboarded(false);
        }
      } finally {
        if (isMounted) {
          setIsBooting(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const continueToFeed = useCallback(async (nextName) => {
    const trimmedName = nextName.trim();

    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.name, trimmedName],
        [STORAGE_KEYS.hasOnboarded, "true"]
      ]);

      setName(trimmedName);
      setHasOnboarded(true);
      setScreen("home");
      return true;
    } catch {
      showStorageError("save your profile");
      return false;
    }
  }, []);

  const saveProfileName = useCallback(async (nextName) => {
    const trimmedName = nextName.trim();

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.name, trimmedName);
      setName(trimmedName);
      setScreen("home");
      return true;
    } catch {
      showStorageError("save your profile");
      return false;
    }
  }, []);

  const saveJournalEntry = useCallback(
    async (entry) => {
      const nextEntries = [
        entry,
        ...journalEntries.filter((currentEntry) => currentEntry.id !== entry.id)
      ].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.journalEntries, JSON.stringify(nextEntries));
        setJournalEntries(nextEntries);
        return true;
      } catch {
        showStorageError("save your reflection");
        return false;
      }
    },
    [journalEntries]
  );

  const deleteJournalEntry = useCallback(
    async (id) => {
      const nextEntries = journalEntries.filter((entry) => entry.id !== id);

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.journalEntries, JSON.stringify(nextEntries));
        setJournalEntries(nextEntries);
        return true;
      } catch {
        showStorageError("delete your reflection");
        return false;
      }
    },
    [journalEntries]
  );

  const savePrayerRequest = useCallback(
    async (request) => {
      const nextRequests = [
        request,
        ...prayerRequests.filter((currentRequest) => currentRequest.id !== request.id)
      ].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.prayerRequests, JSON.stringify(nextRequests));
        setPrayerRequests(nextRequests);
        return true;
      } catch {
        showStorageError("save your prayer request");
        return false;
      }
    },
    [prayerRequests]
  );

  const deletePrayerRequest = useCallback(
    async (id) => {
      const nextRequests = prayerRequests.filter((request) => request.id !== id);

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.prayerRequests, JSON.stringify(nextRequests));
        setPrayerRequests(nextRequests);
        return true;
      } catch {
        showStorageError("delete your prayer request");
        return false;
      }
    },
    [prayerRequests]
  );

  const markPrayerRequestPrayed = useCallback(
    async (id) => {
      const now = new Date().toISOString();
      const nextRequests = prayerRequests
        .map((request) => {
          if (request.id !== id) {
            return request;
          }

          return {
            ...request,
            lastPrayedAt: now,
            prayerCount: request.prayerCount + 1,
            updatedAt: now
          };
        })
        .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.prayerRequests, JSON.stringify(nextRequests));
        setPrayerRequests(nextRequests);
        return true;
      } catch {
        showStorageError("update your prayer request");
        return false;
      }
    },
    [prayerRequests]
  );

  const togglePrayerRequestAnswered = useCallback(
    async (id) => {
      const now = new Date().toISOString();
      const nextRequests = prayerRequests
        .map((request) => {
          if (request.id !== id) {
            return request;
          }

          return {
            ...request,
            answeredAt: request.answeredAt ? null : now,
            updatedAt: now
          };
        })
        .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.prayerRequests, JSON.stringify(nextRequests));
        setPrayerRequests(nextRequests);
        return true;
      } catch {
        showStorageError("update your prayer request");
        return false;
      }
    },
    [prayerRequests]
  );

  const toggleSaved = useCallback(
    async (id) => {
      const nextSavedIds = new Set(savedIds);
      const nextSavedNotes = { ...savedNotes };
      const nextFavoriteSavedIds = new Set(favoriteSavedIds);

      if (nextSavedIds.has(id)) {
        nextSavedIds.delete(id);
        delete nextSavedNotes[id];
        nextFavoriteSavedIds.delete(id);
      } else {
        nextSavedIds.add(id);
      }

      try {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.savedIds, JSON.stringify([...nextSavedIds])],
          [STORAGE_KEYS.savedNotes, JSON.stringify(nextSavedNotes)],
          [STORAGE_KEYS.favoriteSavedIds, JSON.stringify([...nextFavoriteSavedIds])]
        ]);
        setFavoriteSavedIds(nextFavoriteSavedIds);
        setSavedIds(nextSavedIds);
        setSavedNotes(nextSavedNotes);
        return true;
      } catch {
        showStorageError("update saved notes");
        return false;
      }
    },
    [favoriteSavedIds, savedIds, savedNotes]
  );

  const savePersonalNote = useCallback(
    async (id, note) => {
      const trimmedNote = note.trim();
      const nextSavedNotes = { ...savedNotes };

      if (trimmedNote) {
        nextSavedNotes[id] = trimmedNote;
      } else {
        delete nextSavedNotes[id];
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.savedNotes, JSON.stringify(nextSavedNotes));
        setSavedNotes(nextSavedNotes);
        return true;
      } catch {
        showStorageError("save your personal note");
        return false;
      }
    },
    [savedNotes]
  );

  const toggleFavorite = useCallback(
    async (id) => {
      const nextFavoriteSavedIds = new Set(favoriteSavedIds);

      if (nextFavoriteSavedIds.has(id)) {
        nextFavoriteSavedIds.delete(id);
      } else {
        nextFavoriteSavedIds.add(id);
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.favoriteSavedIds, JSON.stringify([...nextFavoriteSavedIds]));
        setFavoriteSavedIds(nextFavoriteSavedIds);
        return true;
      } catch {
        showStorageError("update your favorites");
        return false;
      }
    },
    [favoriteSavedIds]
  );

  const resetSeenNotes = useCallback(() => {
    Alert.alert(
      "Reset seen notes?",
      "Your feed will start a fresh shuffled cycle of encouragements.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await AsyncStorage.multiSet([
                [STORAGE_KEYS.seenIds, "[]"],
                [STORAGE_KEYS.seenHistory, "{}"]
              ]);
              setSeenHistory({});
              setSeenIds(new Set());
              setScreen("home");
            } catch {
              showStorageError("reset seen notes");
            }
          }
        }
      ]
    );
  }, []);

  const openMenu = useCallback(() => {
    menuHostRef.current?.open();
  }, []);

  const navigateFromMenu = useCallback((nextScreen) => {
    if (nextScreen === "today") {
      const nextItem = getUnseenQueue(seenIds, getTodayFeedItems(name))[0] ?? getTodayFeedItems(name)[0] ?? null;
      setSelectedMood(null);
      setSelectedEncouragementItem(nextItem);
      setEncouragementReturnTab("checkIn");
      setScreen("encouragement");
      return;
    }

    if (nextScreen === "journal") {
      setQuickJournalLinkedItem(null);
      setQuickJournalPrompt(null);
    }

    if (nextScreen === "prayer") {
      setQuickPrayerLinkedItem(null);
      setQuickPrayerPrompt(null);
    }

    setScreen(nextScreen);
  }, [name, seenIds]);

  const clearSavedNotes = useCallback(() => {
    Alert.alert(
      "Clear saved notes?",
      "This removes all saved encouragements from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiSet([
                [STORAGE_KEYS.savedIds, "[]"],
                [STORAGE_KEYS.savedNotes, "{}"],
                [STORAGE_KEYS.favoriteSavedIds, "[]"]
              ]);
              setFavoriteSavedIds(new Set());
              setSavedIds(new Set());
              setSavedNotes({});
              setScreen("home");
            } catch {
              showStorageError("clear saved notes");
            }
          }
        }
      ]
    );
  }, []);

  const toggleDailyReminder = useCallback(async () => {
    try {
      if (notificationHour !== null) {
        await cancelDailyReminder();
        await AsyncStorage.removeItem(STORAGE_KEYS.notificationHour);
        setNotificationHour(null);
        return;
      }

      const granted = await requestNotificationPermission();

      if (!granted) {
        return;
      }

      const scheduledHour = await scheduleDailyReminder(DEFAULT_NOTIFICATION_HOUR);

      if (scheduledHour === null) {
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.notificationHour, `${scheduledHour}`);
      setNotificationHour(`${scheduledHour}`);
    } catch {
      Alert.alert(
        "Reminder not saved",
        "The daily reminder could not be updated. Please try again from Profile."
      );
    }
  }, [notificationHour]);

  const setDailyReminderHour = useCallback(
    async (hour) => {
      try {
        const granted = notificationHour !== null || (await requestNotificationPermission());

        if (!granted) {
          return;
        }

        const scheduledHour = await scheduleDailyReminder(hour);

        if (scheduledHour === null) {
          return;
        }

        await AsyncStorage.setItem(STORAGE_KEYS.notificationHour, `${scheduledHour}`);
        setNotificationHour(`${scheduledHour}`);
      } catch {
        Alert.alert(
          "Reminder not saved",
          "The daily reminder could not be updated. Please try again from Profile."
        );
      }
    },
    [notificationHour]
  );

  const requestShare = useCallback((item) => {
    setShareReturnScreen(["encouragement", "explore", "home", "recent", "saved", "today"].includes(screen) ? screen : "encouragement");
    setShareItem(item);
    setScreen("share");
  }, [screen]);

  const closeShare = useCallback(() => {
    setShareItem(null);
    setScreen(shareReturnScreen);
  }, [shareReturnScreen]);

  const shareEncouragement = useCallback(
    async (message) => {
      try {
        await Share.share({
          message,
          title: APP_NAME
        });
      } catch {
        Alert.alert(
          "Share did not open",
          "Please try again. If this keeps happening in Expo Go, it should work in the installed TestFlight build."
        );
      }
    },
    []
  );

  const shareAppInvite = useCallback(async () => {
    try {
      await Share.share({
        message: APP_INVITE_MESSAGE,
        title: APP_NAME
      });
    } catch {
      Alert.alert(
        "Share did not open",
        "Please try again. If this keeps happening in Expo Go, it should work in the installed TestFlight build."
      );
    }
  }, []);

  const dailyJournalPrompt = useMemo(() => getDailyItem(JOURNAL_PROMPTS), []);
  const dailyPrayerPrompt = useMemo(() => getDailyItem(PRAYER_PROMPTS), []);
  const hasCheckedInToday = moodEntries.some((entry) => getDateKey(entry.createdAt) === getDateKey(new Date()));

  const startJournalPrompt = useCallback((prompt) => {
    setQuickJournalLinkedItem(null);
    setQuickJournalPrompt(prompt);
    setScreen("journal");
  }, []);

  const startPrayerPrompt = useCallback((prompt) => {
    setQuickPrayerLinkedItem(null);
    setQuickPrayerPrompt(prompt);
    setScreen("prayer");
  }, []);

  const startJournalFromItem = useCallback((item) => {
    setQuickJournalLinkedItem(item);
    setQuickJournalPrompt({
      body: "This encouragement is showing me...",
      label: "What I Read",
      title: `Reflection on ${item.verse_reference}`
    });
    setScreen("journal");
  }, []);

  const startPrayerFromItem = useCallback((item) => {
    setQuickPrayerLinkedItem(item);
    setQuickPrayerPrompt({
      body: "Lord, help me receive this word with faith and walk in it today...",
      label: "For Today",
      title: `Prayer from ${item.verse_reference}`
    });
    setScreen("prayer");
  }, []);

  const rememberSeenItem = useCallback((item) => {
    if (!item?.id) {
      return;
    }

    const timestamp = new Date().toISOString();

    setSeenIds((currentSeenIds) => {
      if (currentSeenIds.has(item.id)) {
        return currentSeenIds;
      }

      const nextSeenIds = new Set(currentSeenIds);
      nextSeenIds.add(item.id);
      AsyncStorage.setItem(STORAGE_KEYS.seenIds, JSON.stringify([...nextSeenIds])).catch(() => {});
      return nextSeenIds;
    });

    setSeenHistory((currentHistory) => {
      const nextHistory = {
        ...currentHistory,
        [item.id]: timestamp
      };

      AsyncStorage.setItem(STORAGE_KEYS.seenHistory, JSON.stringify(nextHistory)).catch(() => {});
      return nextHistory;
    });
  }, []);

  const selectEncouragementForMood = useCallback(
    (mood, excludeId = null) => {
      const sourceItems = getMoodFeedItems(name, mood);
      const availableItems = sourceItems.filter((item) => item.id !== excludeId);
      const queue = getUnseenQueue(seenIds, availableItems.length > 0 ? availableItems : sourceItems);
      return queue[0] ?? sourceItems[0] ?? null;
    },
    [name, seenIds]
  );

  const openEncouragement = useCallback(
    (item, { mood = null, tab = "home" } = {}) => {
      if (!item) {
        return;
      }

      setSelectedMood(mood);
      setSelectedEncouragementItem(item);
      setEncouragementReturnTab(tab);
      rememberSeenItem(item);
      setScreen("encouragement");
    },
    [rememberSeenItem]
  );

  const openHome = useCallback(() => {
    setScreen("home");
  }, []);

  const openCheckIn = useCallback(() => {
    setScreen("checkIn");
  }, []);

  const openMoodTracker = useCallback(() => {
    setScreen("moodTracker");
  }, []);

  const openToday = useCallback(() => {
    const nextItem = selectEncouragementForMood(null);
    openEncouragement(nextItem, { mood: null, tab: "checkIn" });
  }, [openEncouragement, selectEncouragementForMood]);

  const openMoodFeed = useCallback((mood) => {
    const nextItem = selectEncouragementForMood(mood);
    openEncouragement(nextItem, { mood, tab: "checkIn" });
  }, [openEncouragement, selectEncouragementForMood]);

  const saveDailyCheckIn = useCallback(
    async (entry, mood) => {
      const nextEntry = {
        ...entry,
        id: entry.id || `${Date.now()}`
      };

      setMoodEntries((currentEntries) => {
        const nextEntries = [nextEntry, ...currentEntries]
          .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

        AsyncStorage.setItem(STORAGE_KEYS.moodEntries, JSON.stringify(nextEntries)).catch(() => {
          showStorageError("save your daily check-in");
        });

        return nextEntries;
      });

      const nextMood = mood ?? MOOD_OPTIONS.find((option) => option.label === nextEntry.mood) ?? null;
      const nextItem = selectEncouragementForMood(nextMood);
      openEncouragement(nextItem, { mood: nextMood, tab: "checkIn" });
    },
    [openEncouragement, selectEncouragementForMood]
  );

  const openSavedEncouragement = useCallback((item) => {
    openEncouragement(item, { mood: null, tab: "notes" });
  }, [openEncouragement]);

  const showNextEncouragement = useCallback(() => {
    const nextItem = selectEncouragementForMood(selectedMood, selectedEncouragementItem?.id ?? null);
    openEncouragement(nextItem, { mood: selectedMood, tab: encouragementReturnTab });
  }, [encouragementReturnTab, openEncouragement, selectEncouragementForMood, selectedEncouragementItem, selectedMood]);

  const openSaved = useCallback(() => {
    setScreen("saved");
  }, []);

  const openJournal = useCallback(() => {
    setQuickJournalLinkedItem(null);
    setQuickJournalPrompt(null);
    setScreen("journal");
  }, []);

  const openPrayer = useCallback(() => {
    setQuickPrayerLinkedItem(null);
    setQuickPrayerPrompt(null);
    setScreen("prayer");
  }, []);

  const openProfile = useCallback(() => {
    setScreen("settings");
  }, []);

  const renderWithMenu = useCallback(
    (content) => (
      <View style={styles.appFrame}>
        {content}
        <StaticAppChrome
          onOpenCheckIn={openCheckIn}
          onOpenHome={openHome}
          onOpenMoodTracker={openMoodTracker}
          onOpenProfile={openProfile}
          onOpenSaved={openSaved}
          onOpenSettings={openMenu}
          selected={screen === "home" ? (hasCheckedInToday ? "moodTracker" : "checkIn") : getChromeSelectedTab(screen, encouragementReturnTab)}
        />
        <MenuHost
          ref={menuHostRef}
          name={name}
          onNavigate={navigateFromMenu}
          onResetSeen={resetSeenNotes}
        />
      </View>
    ),
    [
      encouragementReturnTab,
      hasCheckedInToday,
      name,
      navigateFromMenu,
      openCheckIn,
      openHome,
      openJournal,
      openMenu,
      openMoodTracker,
      openProfile,
      openSaved,
      resetSeenNotes,
      screen
    ]
  );

  if (isBooting) {
    return <SplashScreen />;
  }

  if (!hasOnboarded) {
    return (
      <View style={styles.appFrame}>
        <NameScreen initialName={name} onContinue={continueToFeed} />
      </View>
    );
  }

  if (screen === "saved") {
    return renderWithMenu(
      <SavedScreen
        favoriteSavedIds={favoriteSavedIds}
        name={name}
        onBack={openHome}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onOpenItem={openSavedEncouragement}
        onSavePersonalNote={savePersonalNote}
        onShare={requestShare}
        onStartJournal={startJournalFromItem}
        onStartPrayer={startPrayerFromItem}
        onToggleFavorite={toggleFavorite}
        onToggleSaved={toggleSaved}
        savedIds={savedIds}
        savedNotes={savedNotes}
      />
    );
  }

  if (screen === "share") {
    return renderWithMenu(
      <SharePreviewScreen
        item={shareItem}
        onBack={closeShare}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onShare={shareEncouragement}
      />
    );
  }

  if (screen === "settings") {
    return renderWithMenu(
      <SettingsScreen
        name={name}
        notificationHour={notificationHour}
        onBack={openHome}
        onClearSaved={clearSavedNotes}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onResetSeen={resetSeenNotes}
        onSave={saveProfileName}
        onSetNotificationHour={setDailyReminderHour}
        onToggleNotification={toggleDailyReminder}
      />
    );
  }

  if (screen === "encouragement") {
    return renderWithMenu(
      <EncouragementNoteScreen
        isSaved={selectedEncouragementItem ? savedIds.has(selectedEncouragementItem.id) : false}
        item={selectedEncouragementItem}
        name={name}
        onNext={showNextEncouragement}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onReflect={startJournalFromItem}
        onShare={requestShare}
        onToggleSaved={toggleSaved}
        selectedTab={encouragementReturnTab}
      />
    );
  }

  if (screen === "today") {
    return renderWithMenu(
      <FeedScreen
        initialSeenHistory={seenHistory}
        initialSeenIds={seenIds}
        moodFilter={selectedMood}
        name={name}
        onOpenHome={openHome}
        onOpenProfile={openProfile}
        onOpenSettings={openMenu}
        onSeenHistoryChange={setSeenHistory}
        onSeenIdsChange={setSeenIds}
        onShare={requestShare}
        onStartJournal={startJournalFromItem}
        onStartPrayer={startPrayerFromItem}
        onToggleSaved={toggleSaved}
        savedIds={savedIds}
      />
    );
  }

  if (screen === "recent") {
    return renderWithMenu(
      <RecentScreen
        name={name}
        onBack={openHome}
        onOpenItem={(item) => openEncouragement(item, { mood: null, tab: "notes" })}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onShare={requestShare}
        onStartJournal={startJournalFromItem}
        onStartPrayer={startPrayerFromItem}
        onToggleSaved={toggleSaved}
        savedIds={savedIds}
        seenHistory={seenHistory}
        seenIds={seenIds}
      />
    );
  }

  if (screen === "moodTracker") {
    return renderWithMenu(
      <MoodTrackerScreen
        entries={moodEntries}
        onOpenHome={openCheckIn}
        onOpenJournal={openJournal}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
      />
    );
  }

  if (screen === "about") {
    return renderWithMenu(
      <AboutScreen
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
      />
    );
  }

  if (screen === "privacy") {
    return renderWithMenu(
      <ToolScreen
        body="Your name, saved notes, reflections, prayers, and reading history stay on this device. The app does not use accounts, ads, analytics, or tracking."
        onBack={openHome}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        title="Privacy"
      />
    );
  }

  if (screen === "care") {
    return renderWithMenu(
      <ToolScreen
        body="These notes are for spiritual encouragement and are not a replacement for pastoral, medical, mental health, or emergency care."
        onBack={openHome}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        title="Care Note"
      />
    );
  }

  if (screen === "explore") {
    return renderWithMenu(
      <ExploreScreen
        name={name}
        onBack={openHome}
        onOpenItem={(item) => openEncouragement(item, { mood: null, tab: "notes" })}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onShare={requestShare}
        onStartJournal={startJournalFromItem}
        onStartPrayer={startPrayerFromItem}
        onToggleSaved={toggleSaved}
        savedIds={savedIds}
      />
    );
  }

  if (screen === "journal") {
    return renderWithMenu(
      <JournalScreen
        entries={journalEntries}
        initialLinkedItem={quickJournalLinkedItem}
        initialPrompt={quickJournalPrompt}
        name={name}
        onBack={openHome}
        onDeleteEntry={deleteJournalEntry}
        onInitialPromptHandled={() => {
          setQuickJournalLinkedItem(null);
          setQuickJournalPrompt(null);
        }}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onSaveEntry={saveJournalEntry}
      />
    );
  }

  if (screen === "prayer") {
    return renderWithMenu(
      <PrayerScreen
        initialLinkedItem={quickPrayerLinkedItem}
        initialPrompt={quickPrayerPrompt}
        onBack={openHome}
        onDeleteRequest={deletePrayerRequest}
        onInitialPromptHandled={() => {
          setQuickPrayerLinkedItem(null);
          setQuickPrayerPrompt(null);
        }}
        onOpenHome={openHome}
        onOpenJournal={openJournal}
        onOpenPrayer={openPrayer}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onMarkPrayed={markPrayerRequestPrayed}
        onSaveRequest={savePrayerRequest}
        onToggleAnswered={togglePrayerRequestAnswered}
        requests={prayerRequests}
      />
    );
  }

  if (screen === "checkIn" || !hasCheckedInToday) {
    return renderWithMenu(
      <HomeScreen
        name={name}
        onOpenHome={openCheckIn}
        onOpenJournal={openJournal}
        onOpenProfile={openProfile}
        onOpenSaved={openSaved}
        onOpenSettings={openMenu}
        onCompleteCheckIn={saveDailyCheckIn}
      />
    );
  }

  return renderWithMenu(
    <MoodTrackerScreen
      entries={moodEntries}
      onOpenHome={openCheckIn}
      onOpenJournal={openJournal}
      onOpenProfile={openProfile}
      onOpenSaved={openSaved}
      onOpenSettings={openMenu}
    />
  );
}

export default function App() {
  const app = (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.webViewport}>
        <View style={styles.webAppFrame}>{app}</View>
      </View>
    );
  }

  return (
    app
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 20,
    flexDirection: "row",
    gap: 7,
    height: 40,
    justifyContent: "center",
    minWidth: 96,
    paddingHorizontal: 15
  },
  actionButtonLabel: {
    color: TOKENS.colors.textInverse,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  },
  actionButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  },
  appFrame: {
    backgroundColor: TOKENS.colors.background,
    flex: 1,
    overflow: "hidden",
    position: "relative"
  },
  chromePlaceholderHidden: {
    opacity: 0
  },
  appTopPadded: {
    height: 78,
    marginBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 14
  },
  aboutContent: {
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 0
  },
  aboutIntro: {
    marginBottom: 14
  },
  aboutTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 42
  },
  aboutSubtitle: {
    color: APP_PURPLE_MUTED,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: 5
  },
  aboutFeatureCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 178,
    overflow: "hidden",
    padding: 20,
    position: "relative",
    ...softShadow({ blur: 18, color: TOKENS.colors.text, opacity: 0.06, y: 6 })
  },
  aboutFeatureImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    opacity: 0.9,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%"
  },
  aboutFeatureWash: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderBottomRightRadius: 34,
    borderTopRightRadius: 34,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "66%"
  },
  aboutFeatureIconBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.76)",
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 34,
    borderWidth: 1,
    flexShrink: 0,
    height: 68,
    justifyContent: "center",
    width: 68
  },
  aboutFeatureCopy: {
    flex: 1,
    gap: 7,
    minWidth: 0
  },
  aboutFeatureTitle: {
    color: TOKENS.colors.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 20
  },
  aboutFeatureBody: {
    color: TOKENS.colors.textStrongSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 17
  },
  aboutValueGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14
  },
  aboutValueGridStacked: {
    flexDirection: "column"
  },
  aboutValueCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 94,
    padding: 14,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  aboutValueIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 24,
    flexShrink: 0,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  aboutValueCopy: {
    flex: 1,
    minWidth: 0
  },
  aboutValueTitle: {
    color: TOKENS.colors.text,
    fontSize: 13.5,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16
  },
  aboutValueBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 4
  },
  aboutVerseCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 124,
    overflow: "hidden",
    paddingHorizontal: 28,
    paddingVertical: 18,
    position: "relative",
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  aboutQuoteMark: {
    color: TOKENS.colors.accentBorder,
    fontSize: 56,
    fontWeight: "900",
    left: 20,
    lineHeight: 56,
    position: "absolute",
    top: 10
  },
  aboutSunGlow: {
    backgroundColor: "rgba(79,70,229,0.06)",
    borderRadius: 60,
    height: 96,
    position: "absolute",
    right: -18,
    top: 22,
    width: 96
  },
  aboutVerseText: {
    color: TOKENS.colors.text,
    fontFamily: SERIF_FONT,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 23,
    maxWidth: 310,
    textAlign: "center"
  },
  aboutVerseCross: {
    color: TOKENS.colors.accent,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 6
  },
  aboutVerseReference: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 15,
    marginTop: 2
  },
  aboutCareCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
    minHeight: 82,
    padding: 16,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  aboutCareIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 28,
    flexShrink: 0,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  aboutCareCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0
  },
  aboutCareTitle: {
    color: TOKENS.colors.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 17
  },
  aboutCareBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 16
  },
  webAppFrame: {
    backgroundColor: TOKENS.colors.background,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    flex: 1,
    maxHeight: 932,
    maxWidth: 430,
    minHeight: 640,
    overflow: "hidden",
    width: "100%",
    ...softShadow({ blur: 48, color: TOKENS.colors.text, opacity: 0.10, y: 18 })
  },
  webViewport: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.background,
    flex: 1,
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%"
  },
  answeredMark: {
    backgroundColor: "#EEFBEF",
    borderRadius: 14,
    color: "#24733B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  arrowButton: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  arrowButtonLabel: {
    color: TOKENS.colors.accent,
    fontSize: 27,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 29,
    marginTop: -1
  },
  arrowButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }]
  },
  backButton: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  backButtonWithLabel: {
    paddingLeft: 10,
    paddingRight: 14,
    width: "auto"
  },
  backButtonText: {
    color: TOKENS.colors.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 15
  },
  bottomNavAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 62,
    paddingHorizontal: 1,
    paddingVertical: 0,
    position: "relative"
  },
  bottomNavActionHovered: {
    opacity: 1
  },
  bottomNavActionInteractive: {
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          outlineStyle: "none"
        }
      : {})
  },
  bottomNavActionDisabled: {
    opacity: 0.38
  },
  bottomNavDivider: {
    backgroundColor: TOKENS.colors.mutedBorder,
    height: 34,
    left: 0,
    position: "absolute",
    top: 13,
    width: 1
  },
  bottomNavInner: {
    alignItems: "center",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    width: 62,
    ...(Platform.OS === "web"
      ? {
          transitionDuration: "180ms",
          transitionProperty: "background-color, border-color, box-shadow, transform",
          transitionTimingFunction: "ease-out"
        }
      : {})
  },
  bottomNavInnerHover: {
    backgroundColor: TOKENS.colors.muted
  },
  bottomNavInnerSelected: {
    backgroundColor: "transparent"
  },
  bottomNavInnerSelectedHover: {
    backgroundColor: TOKENS.colors.accentLight
  },
  bottomNavInnerPressed: {
    backgroundColor: TOKENS.colors.muted
  },
  bottomNavActiveLine: {
    backgroundColor: TOKENS.colors.accent,
    borderRadius: TOKENS.radius.full,
    height: 2,
    marginTop: 4,
    width: 16
  },
  bottomNavLabel: {
    color: TOKENS.colors.textTertiary,
    fontSize: 9,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 10,
    marginTop: 2,
    textAlign: "center"
  },
  bottomNavLabelSelected: {
    color: TOKENS.colors.accent,
    fontWeight: "600"
  },
  bottomNavMarker: {
    color: "#5147E8",
    fontSize: 19,
    fontWeight: "900",
    includeFontPadding: false,
    lineHeight: 20
  },
  bottomNavMarkerSelected: {
    color: "#E53935"
  },
  card: {
    backgroundColor: TOKENS.colors.surface,
    paddingBottom: 42,
    paddingHorizontal: 24,
    paddingTop: 20
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 28
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "flex-end"
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  cardIconButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28
  },
  cardIconButtonText: {
    color: TOKENS.colors.text,
    fontSize: 19,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 20
  },
  emptySaved: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32
  },
  emptySavedHint: {
    color: TOKENS.colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 12
  },
  emptySavedText: {
    color: TOKENS.colors.text,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24
  },
  emptyExplore: {
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  encouragementText: {
    color: TOKENS.colors.text,
    fontWeight: "400",
    letterSpacing: 0
  },
  exploreDetailActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    justifyContent: "flex-end",
    marginTop: 24
  },
  exploreDetailContent: {
    paddingBottom: 54,
    paddingHorizontal: 24,
    paddingTop: 26
  },
  exploreDetailMessage: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 31,
    marginTop: 24
  },
  exploreDetailMeta: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 18,
    gap: 4,
    marginTop: 22,
    padding: 16
  },
  exploreDetailMetaText: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0
  },
  exploreDetailThemes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 30
  },
  exploreHeader: {
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 14
  },
  exploreList: {
    gap: 10,
    paddingBottom: 44,
    paddingHorizontal: 18
  },
  explorePreview: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 17,
    lineHeight: 23,
    marginTop: 10
  },
  exploreReference: {
    color: TOKENS.colors.accent,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 0
  },
  exploreResult: {
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  exploreThemes: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 10
  },
  exploreTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
    marginBottom: 18
  },
  exploreSearchIcon: {
    alignItems: "center",
    backgroundColor: APP_PURPLE_SOFT,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  exploreSearchInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    flex: 1,
    height: 38,
    paddingHorizontal: 0
  },
  exploreSearchPanel: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  recentHeader: {
    paddingHorizontal: 18,
    paddingTop: 2
  },
  recentTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14
  },
  recentTitleCopy: {
    flex: 1,
    minWidth: 0
  },
  recentTitle: {
    color: TOKENS.colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 36
  },
  recentSubtitle: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 8
  },
  recentHistoryIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  recentFilterRow: {
    gap: 10,
    paddingBottom: 14,
    paddingTop: 18
  },
  recentFilterChip: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    minWidth: 58,
    paddingHorizontal: 16
  },
  recentFilterChipSelected: {
    backgroundColor: TOKENS.colors.accent,
    borderColor: TOKENS.colors.accent
  },
  recentFilterChipPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  recentFilterText: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 15
  },
  recentFilterTextSelected: {
    color: TOKENS.colors.textInverse
  },
  recentFilterIconButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 42
  },
  recentFilterIconButtonSelected: {
    backgroundColor: TOKENS.colors.accent,
    borderColor: TOKENS.colors.accent
  },
  recentList: {
    gap: 12,
    paddingBottom: 84,
    paddingHorizontal: 18
  },
  recentCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 }),
    ...(Platform.OS === "web"
      ? {
          transitionDuration: "160ms",
          transitionProperty: "background-color, border-color, box-shadow, transform",
          transitionTimingFunction: "ease-out"
        }
      : {})
  },
  recentCardPressLayer: {
    padding: 16,
    paddingRight: 58,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer"
        }
      : {})
  },
  recentCardHover: {
    backgroundColor: TOKENS.colors.surfaceRaised
  },
  recentCardPressed: {
    backgroundColor: TOKENS.colors.muted,
    transform: [{ scale: 0.99 }]
  },
  recentCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  recentReference: {
    color: TOKENS.colors.accent,
    flex: 1,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16,
    minWidth: 0
  },
  recentCardActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    flexShrink: 0
  },
  recentTimestamp: {
    color: TOKENS.colors.textTertiary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 13
  },
  recentBookmarkButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 16,
    width: 36
  },
  recentBookmarkPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.95 }]
  },
  recentPreview: {
    color: TOKENS.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: 10
  },
  recentTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 11
  },
  recentTag: {
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  recentTagText: {
    color: TOKENS.colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 12
  },
  recentEmptyCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 6,
    padding: 22,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  recentEmptyIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  recentEmptyTitle: {
    color: TOKENS.colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 22,
    marginTop: 14,
    textAlign: "center"
  },
  recentEmptyBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center"
  },
  recentEmptyButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 18
  },
  recentEmptyButtonText: {
    color: TOKENS.colors.textInverse,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 15
  },
  feedContent: {
    backgroundColor: TOKENS.colors.surface
  },
  dailyCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18
  },
  dailyCardAction: {
    color: TOKENS.colors.accent,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 14
  },
  dailyCardBody: {
    color: TOKENS.colors.text,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 6
  },
  dailyCardTitle: {
    color: TOKENS.colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 21
  },
  dailyStack: {
    gap: 12,
    marginTop: 0
  },
  compactChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  controlsPanel: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 22,
    gap: 16,
    marginTop: 18,
    padding: 16
  },
  filterGroup: {
    gap: 8
  },
  filterLabel: {
    color: TOKENS.colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end"
  },
  heartGlyph: {
    color: "#E53935",
    fontSize: 18,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 20
  },
  homeContent: {
    paddingBottom: 54,
    paddingHorizontal: 0,
    paddingTop: 12
  },
  homeDashboard: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 0,
    paddingBottom: 4,
    width: "100%"
  },
  homeDashboardShort: {
    paddingBottom: 4
  },
  homeDashboardSection: {
    flexShrink: 0
  },
  homeDashboardTile: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    height: 140,
    padding: 13,
    paddingBottom: 16,
    ...softShadow({ blur: 22, opacity: 0.035, y: 8 })
  },
  homeDashboardTileCompact: {
    height: 118,
    padding: 12,
    paddingBottom: 15
  },
  homeDashboardTileBody: {
    color: TOKENS.colors.textSecondary,
    flexShrink: 0,
    fontSize: 11.5,
    lineHeight: 14.5,
    marginTop: 4
  },
  homeDashboardTileTitle: {
    color: TOKENS.colors.text,
    flexShrink: 0,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 9
  },
  homeShell: {
    flex: 1
  },
  homeEyebrow: {
    color: TOKENS.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.1,
    lineHeight: 14,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  homeGreeting: {
    color: TOKENS.colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 4
  },
  homeMoodDashboard: {
    justifyContent: "flex-start"
  },
  homeMoodHero: {
    alignItems: "center",
    flexShrink: 0,
    paddingTop: 4
  },
  homeMoodHeroCompact: {
    paddingTop: 0
  },
  homeMoodGreeting: {
    color: APP_PURPLE_MUTED,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
    marginBottom: 7,
    textAlign: "center"
  },
  homeMoodTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 31,
    maxWidth: 260,
    textAlign: "center"
  },
  homeMoodSubtitle: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 9,
    maxWidth: 255,
    textAlign: "center"
  },
  homeMoodGrid: {
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
    marginTop: 16,
    width: "100%"
  },
  homeMoodGridCompact: {
    marginTop: 16
  },
  homeMoodCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 16,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    paddingHorizontal: 8,
    width: "31.5%",
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.05, y: 5 })
  },
  homeMoodCardHover: {
    borderColor: TOKENS.colors.accentBorder,
    transform: [{ translateY: -1 }]
  },
  homeMoodCardPressed: {
    backgroundColor: APP_PURPLE_SOFT,
    borderColor: TOKENS.colors.accentBorder,
    transform: [{ scale: 0.98 }]
  },
  homeMoodIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginBottom: 6,
    width: 44
  },
  homeMoodEmoji: {
    fontSize: 26,
    includeFontPadding: false,
    lineHeight: 30
  },
  homeMoodLabel: {
    color: TOKENS.colors.text,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 15,
    textAlign: "center"
  },
  checkInActionDisabled: {
    opacity: 0.45
  },
  checkInActionPlaceholder: {
    minWidth: 94
  },
  checkInActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    minHeight: 50
  },
  checkInCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: 24,
    ...softShadow({ blur: 12, color: TOKENS.colors.text, opacity: 0.07, y: 4 })
  },
  checkInFinalActions: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end"
  },
  checkInGratitudeInput: {
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 16,
    borderWidth: 1,
    color: APP_PURPLE_TEXT,
    fontSize: 17,
    fontWeight: "700",
    minHeight: 126,
    padding: 16,
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none"
        }
      : {})
  },
  checkInKicker: {
    color: TOKENS.colors.textTertiary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: "uppercase"
  },
  checkInOptionEmoji: {
    fontSize: 20,
    includeFontPadding: false,
    lineHeight: 24,
    textAlign: "center"
  },
  checkInOptionIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    marginBottom: 4,
    width: 30
  },
  checkInOptionIconSelected: {
    backgroundColor: TOKENS.colors.surface
  },
  checkInOptionLabel: {
    color: "#3F3F46",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.1,
    lineHeight: 15,
    minWidth: 0,
    textAlign: "center"
  },
  checkInOptionLabelSelected: {
    color: TOKENS.colors.accent,
    fontWeight: "900"
  },
  checkInOptionPill: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "column",
    gap: 0,
    justifyContent: "center",
    flexBasis: "47.5%",
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 58,
    paddingHorizontal: 8,
    paddingVertical: 7,
    width: "47.5%",
    ...softShadow({ blur: 4, color: TOKENS.colors.text, opacity: 0.05, y: 2 })
  },
  checkInOptionPillSelected: {
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accent,
    borderWidth: 1.5,
    ...softShadow({ blur: 8, color: TOKENS.colors.accent, opacity: 0.15, y: 3 })
  },
  checkInOptionPillHover: {
    borderColor: TOKENS.colors.accentBorderStrong,
    ...softShadow({ blur: 8, color: TOKENS.colors.text, opacity: 0.07, y: 3 })
  },
  checkInOptionPillPressed: {
    backgroundColor: TOKENS.colors.accentLight,
    transform: [{ scale: 0.98 }]
  },
  checkInOptionsWrap: {
    alignContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    width: "100%"
  },
  checkInProgressRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 12
  },
  checkInProgressTrack: {
    backgroundColor: TOKENS.colors.muted,
    borderRadius: TOKENS.radius.full,
    flex: 1,
    height: 3
  },
  checkInProgressTrackActive: {
    backgroundColor: TOKENS.colors.accent,
    borderRadius: TOKENS.radius.full
  },
  checkInQuestion: {
    color: TOKENS.colors.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 32,
    textAlign: "center"
  },
  checkInQuestionArea: {
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 0,
    paddingBottom: 10,
    paddingTop: 18
  },
  checkInSaveButton: {
    alignItems: "center",
    backgroundColor: APP_ACCENT,
    borderRadius: 28,
    flex: 1,
    height: 56,
    justifyContent: "center",
    maxWidth: 220,
    ...softShadow({ blur: 18, color: APP_ACCENT, opacity: 0.20, y: 9 })
  },
  checkInSaveButtonText: {
    color: TOKENS.colors.textInverse,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 24
  },
  checkInSkipButton: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 18
  },
  checkInSkipButtonText: {
    color: TOKENS.colors.accent,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0
  },
  checkInTextAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 44
  },
  checkInTextActionLabel: {
    color: TOKENS.colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 19
  },
  checkInNextAction: {
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 12,
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...softShadow({ blur: 8, color: TOKENS.colors.accent, opacity: 0.15, y: 4 })
  },
  checkInNextActionLabel: {
    color: TOKENS.colors.textInverse,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 19
  },
  checkInNextActionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }]
  },
  gratitudeDate: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 15
  },
  gratitudeEntry: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 14
  },
  gratitudeText: {
    color: APP_PURPLE_TEXT,
    fontFamily: SERIF_FONT,
    fontSize: 15,
    lineHeight: 22
  },
  moodCheckInButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 18,
    flexShrink: 0,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    ...softShadow({ blur: 12, color: TOKENS.colors.accent, opacity: 0.18, y: 5 })
  },
  moodCheckInButtonHover: {
    backgroundColor: TOKENS.colors.accentHover
  },
  moodCheckInButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.97 }]
  },
  moodCheckInButtonText: {
    color: TOKENS.colors.textInverse,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 15
  },
  moodDominantLabel: {
    color: TOKENS.colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16
  },
  moodDominantPill: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  moodDominantValue: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
    lineHeight: 21
  },
  moodEmptyGratitudeCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.70)",
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 16
  },
  moodEmptyGratitudeCopy: {
    flex: 1,
    minWidth: 0
  },
  moodEmptyGratitudeIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  moodEmptyGratitudeText: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 3
  },
  moodEmptyGratitudeTitle: {
    color: TOKENS.colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 18
  },
  moodGratitudeBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  moodGratitudeBadgeText: {
    color: TOKENS.colors.accent,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16
  },
  moodHeatmap: {
    flexDirection: "row",
    gap: 4,
    minWidth: "100%",
    paddingRight: 4,
    paddingTop: 2
  },
  moodHeatmapDay: {
    backgroundColor: "rgba(79,70,229,0.08)",
    borderColor: "rgba(79,70,229,0.08)",
    borderRadius: 4,
    borderWidth: 1,
    height: 12,
    width: 12
  },
  moodHeatmapDayActive: {
    backgroundColor: "rgba(79,70,229,0.32)",
    borderColor: "rgba(79,70,229,0.16)"
  },
  moodHeatmapDayStrong: {
    backgroundColor: APP_ACCENT,
    borderColor: APP_ACCENT
  },
  moodHeatmapDaySelected: {
    borderColor: APP_PURPLE_TEXT,
    borderWidth: 2,
    transform: [{ scale: 1.12 }]
  },
  moodHeatmapLegend: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 0
  },
  moodHeatmapScroll: {
    marginTop: -2
  },
  moodHeatmapWeek: {
    gap: 4
  },
  moodInsightBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 5
  },
  moodInsightCard: {
    backgroundColor: "#FFFBF3",
    borderColor: "rgba(217,119,6,0.13)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 17,
    ...softShadow({ blur: 14, color: "#D97706", opacity: 0.06, y: 6 })
  },
  moodInsightCopy: {
    flex: 1,
    minWidth: 0
  },
  moodInsightIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  moodInsightTitle: {
    color: TOKENS.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 19
  },
  moodLegendChecked: {
    backgroundColor: "rgba(79,70,229,0.32)",
    borderRadius: 5,
    height: 10,
    width: 10
  },
  moodLegendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  moodLegendQuiet: {
    backgroundColor: "rgba(79,70,229,0.08)",
    borderRadius: 5,
    height: 10,
    width: 10
  },
  moodLegendStrong: {
    backgroundColor: APP_ACCENT,
    borderRadius: 5,
    height: 10,
    width: 10
  },
  moodLegendText: {
    color: TOKENS.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 12
  },
  moodSelectedDayCard: {
    backgroundColor: "rgba(255,255,255,0.74)",
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12
  },
  moodSelectedDayCount: {
    color: TOKENS.colors.textInverse,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16
  },
  moodSelectedDayCountBadge: {
    alignItems: "center",
    backgroundColor: APP_ACCENT,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  moodSelectedDayHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  moodSelectedDayKicker: {
    color: TOKENS.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    lineHeight: 12,
    textTransform: "uppercase"
  },
  moodSelectedDayTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 20,
    marginTop: 2
  },
  moodSelectedEmptyText: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  moodSelectedEntry: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10
  },
  moodSelectedEntryGratitude: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 5
  },
  moodSelectedEntryMeta: {
    color: TOKENS.colors.textTertiary,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
    textAlign: "left"
  },
  moodSelectedEntryRow: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 2
  },
  moodSelectedEntryTitle: {
    color: TOKENS.colors.text,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16
  },
  moodMetricCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 94,
    padding: 14,
    ...softShadow({ blur: 12, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  moodMetricIcon: {
    alignItems: "center",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  moodMetricLabel: {
    color: TOKENS.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
    lineHeight: 12,
    marginTop: 2,
    textTransform: "uppercase"
  },
  moodMetricValue: {
    color: TOKENS.colors.text,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 12
  },
  moodPatternCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 24,
    borderWidth: 1,
    gap: 13,
    padding: 16,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 6 })
  },
  moodPatternGrid: {
    gap: 12
  },
  moodPatternHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11
  },
  myNotesHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 18
  },
  myNotesJournalButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 13
  },
  myNotesJournalButtonHover: {
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderStrong
  },
  myNotesJournalButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  },
  myNotesJournalButtonText: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 15
  },
  myNotesTitle: {
    marginBottom: 0
  },
  moodPatternIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  moodPatternRows: {
    gap: 9
  },
  moodPatternSubtitle: {
    color: TOKENS.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 15,
    marginTop: 2
  },
  moodPatternTitle: {
    color: TOKENS.colors.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 20
  },
  moodPatternTitleGroup: {
    flex: 1,
    minWidth: 0
  },
  moodStatFill: {
    borderRadius: 4,
    height: 8
  },
  moodStatLabel: {
    color: TOKENS.colors.textStrongSecondary,
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 16,
    width: 94
  },
  moodStatRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 26
  },
  moodStatTrack: {
    backgroundColor: "rgba(10,10,11,0.06)",
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: "hidden"
  },
  moodStatValue: {
    color: TOKENS.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 15,
    textAlign: "right",
    width: 38
  },
  moodSummaryGrid: {
    flexDirection: "row",
    gap: 10
  },
  moodSummaryGridStacked: {
    flexDirection: "column"
  },
  moodTrackerCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 17,
    ...softShadow({ blur: 18, color: TOKENS.colors.text, opacity: 0.05, y: 7 })
  },
  moodTrackerCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  moodTrackerCardHeaderCopy: {
    flex: 1,
    minWidth: 0
  },
  moodTrackerCardMeta: {
    color: APP_PURPLE_MUTED,
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 15,
    marginTop: 3
  },
  moodTrackerCardTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 22
  },
  moodTrackerContent: {
    gap: 12,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 6
  },
  moodTrackerHeroCard: {
    backgroundColor: "#21163A",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
    position: "relative",
    ...softShadow({ blur: 24, color: "#21163A", opacity: 0.22, y: 12 })
  },
  moodTrackerHeroDivider: {
    backgroundColor: "rgba(255,255,255,0.18)",
    height: 34,
    width: 1
  },
  moodTrackerHeroGlowOne: {
    backgroundColor: "rgba(124,58,237,0.48)",
    borderRadius: 80,
    height: 160,
    position: "absolute",
    right: -45,
    top: -58,
    width: 160
  },
  moodTrackerHeroGlowTwo: {
    backgroundColor: "rgba(14,165,233,0.18)",
    borderRadius: 70,
    bottom: -42,
    height: 140,
    left: -48,
    position: "absolute",
    width: 140
  },
  moodTrackerHeroHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  moodTrackerHeroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  moodTrackerHeroKicker: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    lineHeight: 14,
    textTransform: "uppercase"
  },
  moodTrackerHeroStat: {
    flex: 1
  },
  moodTrackerHeroStats: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  moodTrackerHeroStatLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 13,
    marginTop: 2
  },
  moodTrackerHeroStatValue: {
    color: TOKENS.colors.textInverse,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 27
  },
  moodTrackerSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 286
  },
  moodTrackerTitle: {
    color: TOKENS.colors.textInverse,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
    marginTop: 18
  },
  homeCardGrid: {
    flexDirection: "row",
    gap: 10
  },
  homeGrid: {
    gap: 0,
    marginTop: 28
  },
  homeHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  homeHero: {
    flexShrink: 0
  },
  homeHeroCompact: {
    transform: [{ scale: 0.96 }]
  },
  homeInteractiveBase: {
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          transitionDuration: "150ms",
          transitionProperty: "background-color, border-color, box-shadow, opacity, transform",
          transitionTimingFunction: "ease-out"
        }
      : {})
  },
  homeInteractiveHover: {
    borderColor: TOKENS.colors.accentBorder,
    transform: [{ translateY: -1 }]
  },
  homeInteractivePressed: {
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderStrong,
    transform: [{ scale: 0.98 }]
  },
  homePrimaryCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flexShrink: 0,
    height: 230,
    overflow: "hidden",
    padding: 20,
    position: "relative",
    ...softShadow({ blur: 18, color: TOKENS.colors.text, opacity: 0.06, y: 7 })
  },
  homePrimaryCardCompact: {
    height: 190,
    padding: 16
  },
  homeMoodPrimaryCard: {
    borderRadius: 22,
    height: 172,
    marginBottom: 8,
    marginTop: 0,
    padding: 16
  },
  homeMoodPrimaryCardCompact: {
    height: 160,
    marginTop: 0,
    padding: 14
  },
  homePrimaryInteractiveHover: {
    borderColor: TOKENS.colors.accentBorderStrong,
    transform: [{ translateY: -1 }]
  },
  homePrimaryInteractivePressed: {
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderStrong,
    transform: [{ scale: 0.98 }]
  },
  homePrimaryArt: {
    bottom: 0,
    height: "86%",
    overflow: "hidden",
    position: "absolute",
    right: 0,
    width: "78%"
  },
  homePrimaryImage: {
    bottom: 0,
    height: "100%",
    position: "absolute",
    right: 0,
    top: 0,
    width: "170%"
  },
  homePrimaryImageNarrow: {
    right: 0,
    width: "250%"
  },
  homePrimaryCopy: {
    maxWidth: "63%",
    position: "relative",
    zIndex: 1
  },
  homePrimaryKickerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  homePrimaryReadabilityWash: {
    backgroundColor: "rgba(255,251,243,0.66)",
    borderBottomRightRadius: 34,
    borderRadius: 24,
    height: 136,
    left: -26,
    position: "absolute",
    top: -8,
    width: 242
  },
  homePrimaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    height: 40,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 20
  },
  homePrimaryButtonCompact: {
    height: 34,
    marginTop: 8,
    paddingHorizontal: 17
  },
  homePrimaryButtonText: {
    color: TOKENS.colors.textInverse,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  },
  homePrimaryDetail: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 225,
    opacity: 0.9
  },
  homePrimaryDetailCompact: {
    fontSize: 12,
    lineHeight: 15,
    maxWidth: 210
  },
  homePrimaryLabel: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 8
  },
  homePrimaryTitle: {
    color: TOKENS.colors.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30,
    marginTop: 10,
    maxWidth: 230
  },
  homePrimaryTitleCompact: {
    fontSize: 25,
    lineHeight: 26,
    maxWidth: 205
  },
  homeMoodFallbackNote: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginLeft: 0,
    marginTop: 0,
    maxWidth: 172
  },
  homeMoodFallbackNoteCompact: {
    fontSize: 11,
    lineHeight: 15,
    maxWidth: 160
  },
  homeMoodFallbackNoteNarrow: {
    maxWidth: 188
  },
  homeMoodPrimaryTitle: {
    fontSize: 23,
    lineHeight: 24,
    marginTop: 22,
    maxWidth: 260
  },
  homeMoodPrimaryTitleCompact: {
    fontSize: 21,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 232
  },
  homeMoodPrimaryTitleNarrow: {
    maxWidth: 248
  },
  homeSection: {
    marginTop: 24
  },
  homeSectionAside: {
    color: TOKENS.colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 12
  },
  homeSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    height: 22,
    marginBottom: 9
  },
  homeSectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  homeSectionHeadingText: {
    color: TOKENS.colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    lineHeight: 13,
    textTransform: "uppercase"
  },
  homeSectionIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22
  },
  homeSectionLabel: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 10,
    textTransform: "uppercase"
  },
  homeSectionLine: {
    backgroundColor: TOKENS.colors.accentWash,
    borderRadius: 1,
    flex: 1,
    height: 1,
    marginTop: 1
  },
  homeSmallTile: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 118,
    padding: 16
  },
  homeSmallTileDetail: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    marginTop: 7
  },
  homeSmallTileTitle: {
    color: TOKENS.colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 24
  },
  homeSun: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 29,
    bottom: 54,
    height: 58,
    position: "absolute",
    right: 38,
    width: 58
  },
  homeMountain: {
    borderRadius: 72,
    position: "absolute",
    transform: [{ rotate: "-7deg" }]
  },
  homeMountainBack: {
    backgroundColor: "rgba(231,207,255,0.82)",
    bottom: 10,
    height: 70,
    right: -50,
    width: 250
  },
  homeMountainMid: {
    backgroundColor: "rgba(190,158,247,0.78)",
    bottom: -16,
    height: 74,
    right: -36,
    width: 276
  },
  homeMountainFront: {
    backgroundColor: "rgba(109,76,208,0.72)",
    bottom: -62,
    height: 90,
    right: -62,
    width: 320
  },
  homeStat: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "48%",
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  homeStatLabel: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 2
  },
  homeStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20
  },
  homeStatValue: {
    color: TOKENS.colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 32
  },
  homeTileAction: {
    color: TOKENS.colors.accent,
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 12
  },
  homeTileActionRow: {
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
    gap: 4,
    marginTop: "auto"
  },
  homeTileIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  homeTileIconBadgeCompact: {
    borderRadius: 19,
    height: 38,
    width: 38
  },
  homeSkyWash: {
    backgroundColor: "rgba(255,255,255,0.44)",
    borderRadius: 95,
    height: 120,
    position: "absolute",
    right: -8,
    top: -8,
    width: 210
  },
  homeSkyGlow: {
    backgroundColor: "rgba(246,225,255,0.60)",
    borderRadius: 95,
    height: 120,
    position: "absolute",
    right: -22,
    top: 0,
    width: 200
  },
  homeHorizonGlow: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 60,
    bottom: 40,
    height: 70,
    position: "absolute",
    right: -10,
    width: 230
  },
  homeMistBand: {
    backgroundColor: "rgba(255,255,255,0.38)",
    borderRadius: 36,
    height: 32,
    position: "absolute",
    transform: [{ rotate: "-7deg" }],
    width: 238
  },
  homeMistBandHigh: {
    right: -8,
    top: 100
  },
  homeMistBandLow: {
    right: -36,
    top: 124
  },
  journalBodyInput: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 20,
    borderWidth: 1,
    color: TOKENS.colors.text,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 12,
    minHeight: 210,
    padding: 16
  },
  journalEditorContent: {
    paddingBottom: 54,
    paddingHorizontal: 24,
    paddingTop: 30
  },
  journalEntry: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18
  },
  journalEntryTitle: {
    color: TOKENS.colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 26
  },
  journalLinkBox: {
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    marginTop: 22,
    padding: 18
  },
  journalPreview: {
    color: TOKENS.colors.text,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 8
  },
  journalSearchInput: {
    marginTop: 16
  },
  journalTitleInput: {
    color: TOKENS.colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 33,
    paddingVertical: 8
  },
  homeTile: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18
  },
  homeTileDetail: {
    color: TOKENS.colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4
  },
  homeTileTitle: {
    color: TOKENS.colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 33
  },
  homeTitle: {
    color: TOKENS.colors.text,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 42
  },
  horizontalChips: {
    gap: 8,
    paddingRight: 12
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  iconButtonLabel: {
    color: TOKENS.colors.accent,
    fontSize: 20,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 22
  },
  iconButtonLabelSelected: {
    color: TOKENS.colors.textInverse
  },
  iconButtonSelected: {
    backgroundColor: TOKENS.colors.accent
  },
  loadingFeed: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 640
  },
  linkedPreview: {
    color: TOKENS.colors.text,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5
  },
  linkedResult: {
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12
  },
  linkedResultSelected: {
    borderColor: TOKENS.colors.accent,
    borderWidth: 2
  },
  linkedSelected: {
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 18,
    padding: 14
  },
  linkResults: {
    gap: 8
  },
  modalActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 20
  },
  modalCancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  modalCancelLabel: {
    color: TOKENS.colors.text,
    fontSize: 14,
    fontStyle: "italic"
  },
  modalCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 24,
    padding: 22
  },
  modalOverlay: {
    backgroundColor: "rgba(255,255,255,0.86)",
    flex: 1,
    justifyContent: "center"
  },
  modalTitle: {
    color: TOKENS.colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 31,
    marginBottom: 14
  },
  nameActions: {
    alignItems: "center",
    gap: 16
  },
  nameContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 36
  },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    color: TOKENS.colors.text,
    fontSize: 14,
    fontStyle: "italic",
    height: 44,
    letterSpacing: 1.4,
    marginTop: 8,
    paddingHorizontal: 12
  },
  nameTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 43
  },
  pressed: {
    opacity: 0.6
  },
  pointerEventsNone: {
    pointerEvents: "none"
  },
  profileTile: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 12,
    height: 58,
    paddingHorizontal: 12
  },
  profileTileCompact: {
    height: 50
  },
  profileTileDetail: {
    color: TOKENS.colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2
  },
  profileTileText: {
    flex: 1,
    minWidth: 0
  },
  profileTileTitle: {
    color: TOKENS.colors.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16
  },
  profileIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentWash,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  promptBox: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14
  },
  prayerActionGrid: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 28
  },
  prayerBody: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 18,
    lineHeight: 26,
    marginTop: 18
  },
  prayerDetailContent: {
    paddingBottom: 52,
    paddingHorizontal: 24,
    paddingTop: 30
  },
  prayerMeta: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: 12
  },
  prayerRequest: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18
  },
  prayerStatDate: {
    color: TOKENS.colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  },
  prayerStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24
  },
  referenceText: {
    color: "#5147E8",
    fontStyle: "italic"
  },
  readingArticle: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    ...softShadow({ blur: 13, opacity: 0.08, y: 4 })
  },
  readingArticleHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14
  },
  readingContent: {
    gap: 14,
    paddingBottom: 12,
    paddingTop: 24
  },
  readingScroll: {
    flex: 1
  },
  readingDockAction: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 6
  },
  readingDockActionPrimary: {
    backgroundColor: TOKENS.colors.accent
  },
  readingDockActionText: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  },
  readingDockActionTextPrimary: {
    color: TOKENS.colors.textInverse
  },
  readingEyebrow: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 6
  },
  readingReference: {
    color: TOKENS.colors.accent,
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 0
  },
  readingSymbol: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  readerMenuButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  readingSymbolText: {
    color: TOKENS.colors.accent,
    fontSize: 18,
    includeFontPadding: false,
    lineHeight: 20
  },
  rule: {
    backgroundColor: TOKENS.colors.accentWash,
    height: 1,
    marginBottom: 9,
    marginTop: 14,
    width: 46
  },
  resultCount: {
    color: TOKENS.colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 16
  },
  menuCareBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 15,
    marginTop: 4
  },
  menuCareIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 22,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  menuCareNote: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  menuCareText: {
    flex: 1,
    minWidth: 0
  },
  menuCareTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 18
  },
  menuCloseButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  menuCloseRow: {
    alignItems: "flex-end"
  },
  menuContent: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 18
  },
  menuCrown: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 25,
    width: 28
  },
  menuGreeting: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 20,
    padding: 18
  },
  menuGreetingCopy: {
    color: TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 12
  },
  menuGreetingTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 27
  },
  menuGreetingTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row"
  },
  menuOverlay: {
    backgroundColor: "rgba(10,10,11,0.42)",
    flex: 1,
    flexDirection: "row"
  },
  menuPanel: {
    backgroundColor: TOKENS.colors.background,
    borderBottomLeftRadius: 28,
    borderColor: TOKENS.colors.mutedBorder,
    borderLeftWidth: 1,
    borderTopLeftRadius: 28,
    height: "100%",
    marginLeft: "auto",
    maxWidth: 430,
    minWidth: 280,
    overflow: "hidden",
    width: "70%",
    ...softShadow({ blur: 28, color: TOKENS.colors.text, opacity: 0.14, x: -10, y: 0 })
  },
  menuWebPortal: {
    bottom: 0,
    left: 0,
    opacity: 1,
    position: "absolute",
    right: 0,
    top: 0,
    visibility: "visible",
    zIndex: 80
  },
  menuWebPortalHidden: {
    opacity: 0,
    pointerEvents: "none",
    visibility: "hidden"
  },
  menuResetButton: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  menuResetIcon: {
    alignItems: "center",
    backgroundColor: APP_PURPLE_SOFT,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderWidth: 1,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  menuResetLabel: {
    color: TOKENS.colors.accent,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18
  },
  menuRow: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  menuRowHover: {
    backgroundColor: TOKENS.colors.muted,
    borderColor: TOKENS.colors.accentBorder,
    transform: [{ translateY: -1 }]
  },
  menuRowIcon: {
    alignItems: "center",
    backgroundColor: APP_PURPLE_SOFT,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  menuRowPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  menuRowLabel: {
    color: APP_PURPLE_TEXT,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20
  },
  menuScrim: {
    flex: 1
  },
  menuSection: {
    marginTop: 18
  },
  menuSectionRows: {
    gap: 8
  },
  menuSectionTitle: {
    color: TOKENS.colors.textTertiary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    lineHeight: 14,
    marginBottom: 12,
    textTransform: "uppercase"
  },
  favoriteMark: {
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 14,
    color: TOKENS.colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  removeSavedButton: {
    alignSelf: "flex-start",
    marginTop: 28,
    paddingVertical: 8
  },
  removeSavedButtonText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0
  },
  saveNameButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: TOKENS.colors.accent,
    borderColor: TOKENS.colors.accent,
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 24
  },
  saveNameButtonLabel: {
    color: TOKENS.colors.textInverse,
    fontSize: 15,
    fontWeight: "700"
  },
  savedActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "flex-end",
    marginTop: 16
  },
  savedDetailShell: {
    flex: 1
  },
  savedItem: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18
  },
  savedItemHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 8
  },
  savedList: {
    gap: 12,
    paddingBottom: 40,
    paddingHorizontal: 24
  },
  savedMessage: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 18,
    lineHeight: 25
  },
  savedNoteInput: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    color: TOKENS.colors.text,
    fontSize: 15,
    lineHeight: 20,
    minHeight: 116,
    padding: 12
  },
  savedNotePreview: {
    color: TOKENS.colors.accent,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 17,
    marginTop: 12
  },
  savedPersonalBox: {
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 28,
    padding: 16
  },
  savedRule: {
    backgroundColor: TOKENS.colors.accentWash,
    height: 1,
    marginBottom: 9,
    marginTop: 14,
    width: 46
  },
  savedVerse: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 17
  },
  secondaryPillButton: {
    alignItems: "center",
    borderColor: TOKENS.colors.accentBorder,
    borderRadius: 22,
    borderWidth: 1.5,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 18
  },
  secondaryPillButtonText: {
    color: TOKENS.colors.accent,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0
  },
  searchInput: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    color: TOKENS.colors.text,
    fontSize: 15,
    height: 46,
    letterSpacing: 0,
    paddingHorizontal: 12
  },
  scriptureLabel: {
    color: TOKENS.colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  scripturePanel: {
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 18,
    marginTop: 14,
    padding: 14
  },
  scriptureReference: {
    color: TOKENS.colors.accent,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
    marginTop: 8
  },
  screen: {
    backgroundColor: TOKENS.colors.background,
    flex: 1
  },
  staticChromeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40
  },
  staticChromeTopWash: {
    backgroundColor: TOKENS.colors.background,
    borderBottomColor: TOKENS.colors.mutedBorder,
    borderBottomWidth: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  staticChromeTop: {
    backgroundColor: TOKENS.colors.background,
    height: 64,
    left: 0,
    paddingHorizontal: 24,
    position: "absolute",
    right: 0
  },
  staticChromeBottomWash: {
    backgroundColor: TOKENS.colors.background,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0
  },
  staticChromeBottom: {
    height: 68,
    left: 0,
    paddingHorizontal: 24,
    position: "absolute",
    right: 0
  },
  encouragementButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 12
  },
  encouragementButtonHover: {
    borderColor: TOKENS.colors.accentBorderStrong,
    transform: [{ translateY: -1 }]
  },
  encouragementButtonIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: 0 }, { rotate: "0deg" }, { scale: 1 }]
  },
  encouragementButtonIconWrapActive: {
    transform: [{ translateX: 3 }, { rotate: "8deg" }, { scale: 1.06 }]
  },
  encouragementButtonIconWrapPrimaryActive: {
    transform: [{ translateX: 5 }, { rotate: "18deg" }, { scale: 1.08 }]
  },
  encouragementButtonInteractive: {
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          transitionDuration: "200ms",
          transitionProperty: "background-color, box-shadow, opacity, transform",
          transitionTimingFunction: "ease-out"
        }
      : {})
  },
  encouragementButtonPressed: {
    transform: [{ scale: 0.95 }]
  },
  encouragementButtonPrimary: {
    backgroundColor: APP_ACCENT,
    borderColor: APP_ACCENT,
    ...softShadow({ blur: 16, color: APP_ACCENT, opacity: 0.20, y: 8 })
  },
  encouragementButtonSecondary: {
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    ...softShadow({ blur: 8, color: TOKENS.colors.text, opacity: 0.03, y: 4 })
  },
  encouragementButtonSelected: {
    backgroundColor: APP_PURPLE_SOFT,
    borderColor: TOKENS.colors.accentBorderStrong
  },
  encouragementButtonText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 14,
    marginLeft: 2,
    transform: [{ translateX: 0 }]
  },
  encouragementButtonTextActive: {
    transform: [{ translateX: 2 }]
  },
  encouragementButtonTextPrimary: {
    color: TOKENS.colors.textInverse,
    fontSize: 14,
    lineHeight: 18
  },
  encouragementButtonTextSecondary: {
    color: TOKENS.colors.accent
  },
  encouragementActionButton: {
    alignItems: "center",
    backgroundColor: APP_SURFACE,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
    ...softShadow({ blur: 8, color: TOKENS.colors.text, opacity: 0.03, y: 4 })
  },
  encouragementActionButtonInteractive: {
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          transitionDuration: "170ms",
          transitionProperty: "background-color, border-color, box-shadow, opacity, transform",
          transitionTimingFunction: "ease-out"
        }
      : {})
  },
  encouragementActionButtonHover: {
    backgroundColor: TOKENS.colors.muted,
    borderColor: TOKENS.colors.accentBorder,
    transform: [{ translateY: -1 }]
  },
  encouragementActionButtonPressed: {
    backgroundColor: TOKENS.colors.accentPressed,
    borderColor: TOKENS.colors.accentBorder,
    transform: [{ scale: 0.97 }]
  },
  encouragementActionButtonSelected: {
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorder
  },
  encouragementActionLabel: {
    color: TOKENS.colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 13,
    marginTop: 1
  },
  encouragementActionRow: {
    flexDirection: "row",
    gap: 8
  },
  encouragementActions: {
    flexShrink: 0,
    gap: 12,
    marginTop: 18,
    position: "relative",
    zIndex: 1
  },
  encouragementGreeting: {
    color: TOKENS.colors.textSecondary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20
  },
  encouragementHidden: {
    opacity: 0
  },
  encouragementLine: {
    color: TOKENS.colors.text,
    fontFamily: SERIF_FONT,
    fontSize: 21,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 31
  },
  encouragementLines: {
    gap: 12,
    marginTop: 24
  },
  encouragementMessageGhost: {
    opacity: 0
  },
  encouragementMessageLive: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  encouragementNextButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    height: 46,
    justifyContent: "center"
  },
  encouragementNextText: {
    color: TOKENS.colors.textInverse,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 18
  },
  encouragementNoteBody: {
    flex: 1,
    marginBottom: 8,
    minHeight: 0
  },
  encouragementNotePanel: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    justifyContent: "space-between",
    minHeight: 0,
    overflow: "hidden",
    padding: 24,
    ...softShadow({ blur: 16, color: TOKENS.colors.text, opacity: 0.05, y: 6 })
  },
  encouragementPanelGlowBottom: {
    backgroundColor: TOKENS.colors.accentWash,
    borderRadius: 130,
    bottom: -78,
    height: 190,
    position: "absolute",
    right: -70,
    width: 190
  },
  encouragementPanelGlowTop: {
    backgroundColor: TOKENS.colors.accentWash,
    borderRadius: 120,
    height: 168,
    left: -72,
    position: "absolute",
    top: -76,
    width: 168
  },
  encouragementContentSpacer: {
    flex: 1
  },
  encouragementRevealArea: {
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 0,
    position: "relative",
    zIndex: 1
  },
  encouragementTypewriterWrap: {
    flexShrink: 0,
    position: "relative"
  },
  encouragementScriptureBlock: {
    flexShrink: 0,
    marginTop: 26
  },
  encouragementScriptureCard: {
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 22,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  encouragementScriptureIntro: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    lineHeight: 16
  },
  encouragementScriptureIntroGhost: {
    opacity: 0
  },
  encouragementScriptureIntroLive: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  encouragementScriptureIntroWrap: {
    position: "relative"
  },
  encouragementScriptureReference: {
    color: TOKENS.colors.accent,
    fontFamily: SERIF_FONT,
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 20,
    marginTop: 12
  },
  encouragementScriptureText: {
    color: TOKENS.colors.text,
    fontFamily: SERIF_FONT,
    fontSize: 15,
    fontStyle: "italic",
    letterSpacing: 0,
    lineHeight: 22
  },
  encouragementScriptureTextGhost: {
    opacity: 0
  },
  encouragementScriptureTextLive: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  encouragementScriptureTextWrap: {
    position: "relative"
  },
  todayScreen: {
    backgroundColor: TOKENS.colors.background,
    flex: 1
  },
  todayCanvas: {
    backgroundColor: TOKENS.colors.background,
    flex: 1,
    overflow: "hidden",
    paddingHorizontal: 24
  },
  todayCardList: {
    flex: 1
  },
  todayCardPage: {
    backgroundColor: TOKENS.colors.background
  },
  todayTopArea: {
    flexGrow: 0,
    flexShrink: 0,
    height: 64,
    marginBottom: 12
  },
  todayTopBar: {
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    minHeight: 56
  },
  todayLogoWrap: {
    justifyContent: "center",
    minHeight: 52,
    overflow: "visible",
    width: 120
  },
  todayMenuButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderWidth: 1,
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    padding: 10,
    width: 44,
    ...softShadow({ blur: 4, color: TOKENS.colors.text, opacity: 0.06, y: 2 })
  },
  todayReadingArea: {
    flex: 1,
    justifyContent: "flex-start",
    marginBottom: 8,
    minHeight: 0
  },
  todayArticle: {
    backgroundColor: APP_SURFACE,
    alignSelf: "stretch",
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 0,
    minHeight: 0,
    overflow: "hidden",
    padding: 22,
    ...softShadow({ blur: 16, color: TOKENS.colors.text, opacity: 0.05, y: 6 })
  },
  todayArticleHeader: {
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
    marginBottom: 20
  },
  todayVerseIcon: {
    alignItems: "center",
    backgroundColor: APP_PURPLE_SOFT,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    marginRight: 14,
    width: 52
  },
  todayReference: {
    color: TOKENS.colors.accent,
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
    minWidth: 0
  },
  todayIconButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36
  },
  todayMessage: {
    color: TOKENS.colors.text,
    fontFamily: SERIF_FONT,
    fontWeight: "400",
    letterSpacing: 0,
    maxWidth: "98%"
  },
  todayMessageSlot: {
    flex: 1,
    justifyContent: "center",
    minHeight: 0,
    paddingVertical: 16
  },
  todayScripture: {
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 22,
    flexShrink: 0,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  todayScriptureLabel: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    lineHeight: 15,
    marginBottom: 10,
    textTransform: "uppercase"
  },
  todayVerse: {
    color: TOKENS.colors.text,
    fontFamily: SERIF_FONT,
    fontStyle: "italic",
    letterSpacing: 0
  },
  todayScriptureReference: {
    color: TOKENS.colors.accent,
    fontFamily: SERIF_FONT,
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 20,
    marginTop: 12
  },
  todayActionArea: {
    flexGrow: 0,
    flexShrink: 0,
    height: 72
  },
  dailyActionNav: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 20,
    borderTopWidth: 1,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 0,
    height: 72,
    justifyContent: "space-between",
    marginTop: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...softShadow({ blur: 12, color: TOKENS.colors.text, opacity: 0.08, y: -4 })
  },
  controlActions: {
    alignItems: "flex-start",
    gap: 10
  },
  profileSection: {
    marginTop: 30
  },
  profileSectionTitle: {
    color: TOKENS.colors.text,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 21,
    marginBottom: 7
  },
  profileText: {
    color: TOKENS.colors.text,
    fontSize: 15,
    lineHeight: 20,
    maxWidth: 320
  },
  profileTitleBlock: {
    gap: 5,
    marginBottom: 14
  },
  settingsSubtitle: {
    color: APP_PURPLE_MUTED,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 19
  },
  profileNameCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 158,
    overflow: "hidden",
    padding: 18,
    position: "relative",
    ...softShadow({ blur: 16, color: TOKENS.colors.text, opacity: 0.05, y: 6 })
  },
  profileNameGlow: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 90,
    height: 150,
    position: "absolute",
    right: -38,
    top: -58,
    width: 150
  },
  profileNameAura: {
    backgroundColor: TOKENS.colors.accentWash,
    borderRadius: 80,
    bottom: -64,
    height: 132,
    left: -46,
    position: "absolute",
    width: 132
  },
  profileAvatarBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 31,
    borderWidth: 1,
    flexShrink: 0,
    height: 62,
    justifyContent: "center",
    marginTop: 2,
    width: 62
  },
  profileNameForm: {
    flex: 1,
    gap: 9,
    minWidth: 0
  },
  profileNameLabel: {
    color: TOKENS.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 19
  },
  profileNameInput: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: TOKENS.colors.text,
    fontSize: 14,
    fontWeight: "700",
    height: 42,
    paddingHorizontal: 13,
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none"
        }
      : {})
  },
  profileNameInputFocused: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.accentBorderStrong
  },
  profileSaveButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    minWidth: 88,
    paddingHorizontal: 22,
    ...softShadow({ blur: 16, color: TOKENS.colors.accent, opacity: 0.18, y: 8 })
  },
  profileSaveButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  profileSaveButtonLabel: {
    color: TOKENS.colors.textInverse,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16
  },
  profileInfoCard: {
    alignItems: "flex-start",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
    padding: 17,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  profileInfoIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 25,
    flexShrink: 0,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  profileInfoCopy: {
    flex: 1,
    gap: 5,
    minWidth: 0
  },
  profileCardTitle: {
    color: TOKENS.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 19
  },
  profileCardBody: {
    color: TOKENS.colors.textStrongSecondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 18
  },
  profileMiniGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10
  },
  profileMiniGridStacked: {
    flexDirection: "column"
  },
  profileMiniCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 140,
    padding: 15,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  profileMiniCardCompact: {
    minHeight: 124,
    padding: 12
  },
  profileMiniIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    marginBottom: 12,
    width: 42
  },
  profileMiniIconBadgeCompact: {
    borderRadius: 18,
    height: 36,
    marginBottom: 9,
    width: 36
  },
  profileMiniTitle: {
    color: TOKENS.colors.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 17
  },
  profileMiniTitleCompact: {
    fontSize: 13,
    lineHeight: 15
  },
  profileMiniBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 5
  },
  profileMiniBodyCompact: {
    fontSize: 11,
    lineHeight: 14
  },
  profileReminderCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    padding: 16,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  profileReminderCardCompact: {
    marginTop: 10,
    padding: 12
  },
  profileReminderTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  profileReminderIconBadge: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  profileReminderCopy: {
    flex: 1,
    minWidth: 0
  },
  profileReminderTitle: {
    color: TOKENS.colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
    lineHeight: 18
  },
  profileReminderBody: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3
  },
  profileReminderSwitch: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.muted,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 3,
    width: 52
  },
  profileReminderSwitchEnabled: {
    alignItems: "flex-end",
    backgroundColor: TOKENS.colors.accent
  },
  profileReminderSwitchPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  profileReminderSwitchKnob: {
    backgroundColor: TOKENS.colors.surface,
    borderRadius: 11,
    height: 22,
    width: 22,
    ...softShadow({ blur: 5, color: TOKENS.colors.text, opacity: 0.12, y: 1 })
  },
  profileReminderSwitchKnobEnabled: {
    backgroundColor: TOKENS.colors.textInverse
  },
  profileReminderTimes: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  profileReminderTime: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 8
  },
  profileReminderTimeHover: {
    borderColor: TOKENS.colors.accentBorderStrong
  },
  profileReminderTimePressed: {
    backgroundColor: TOKENS.colors.accentLight,
    transform: [{ scale: 0.98 }]
  },
  profileReminderTimeSelected: {
    backgroundColor: TOKENS.colors.accent,
    borderColor: TOKENS.colors.accent
  },
  profileReminderTimeText: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15
  },
  profileReminderTimeTextSelected: {
    color: TOKENS.colors.textInverse
  },
  profileManageCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
    padding: 16,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  profileManageCardCompact: {
    marginTop: 10,
    padding: 12
  },
  profileManageTitle: {
    color: TOKENS.colors.accent,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.7,
    lineHeight: 16,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  profileManageRows: {
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden"
  },
  profileManageRow: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12
  },
  profileManageRowCompact: {
    minHeight: 46
  },
  profileManageRowHover: {
    backgroundColor: TOKENS.colors.muted
  },
  profileManageRowPressed: {
    backgroundColor: TOKENS.colors.accentLight,
    opacity: 0.9
  },
  profileManageIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24
  },
  profileManageLabel: {
    color: TOKENS.colors.accent,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16
  },
  profileManageLabelCompact: {
    fontSize: 12,
    lineHeight: 15
  },
  profileManageLabelDanger: {
    color: TOKENS.colors.accent
  },
  profileManageDivider: {
    backgroundColor: TOKENS.colors.accentWash,
    height: 1,
    marginLeft: 46
  },
  settingsBody: {
    paddingBottom: 22,
    paddingHorizontal: 24,
    paddingTop: 8
  },
  settingsContent: {
    flex: 1
  },
  settingsTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40
  },
  shareActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18
  },
  shareBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18
  },
  shareContent: {
    flex: 1
  },
  shareEyebrow: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.2,
    lineHeight: 15,
    marginTop: 24,
    textTransform: "uppercase"
  },
  shareHeaderBlock: {
    flexShrink: 0
  },
  sharePrimaryButton: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accent,
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    height: 56,
    justifyContent: "center",
    marginTop: 14,
    ...softShadow({ blur: 20, color: TOKENS.colors.accent, opacity: 0.2, y: 10 })
  },
  sharePrimaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }]
  },
  sharePrimaryButtonText: {
    color: TOKENS.colors.textInverse,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 18
  },
  sharePreviewBox: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 300,
    padding: 16
  },
  sharePreviewCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 26,
    borderWidth: 1,
    flex: 1,
    marginTop: 14,
    minHeight: 0,
    overflow: "hidden",
    padding: 18,
    ...softShadow({ blur: 16, color: TOKENS.colors.text, opacity: 0.05, y: 6 })
  },
  sharePreviewIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  sharePreviewLabel: {
    color: APP_PURPLE_TEXT,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 18
  },
  sharePreviewReference: {
    color: TOKENS.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 15,
    marginTop: 3
  },
  sharePreviewScrollContent: {
    paddingBottom: 4
  },
  sharePreviewText: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 15,
    lineHeight: 22
  },
  sharePreviewTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  sharePreviewTopRow: {
    alignItems: "center",
    borderBottomColor: TOKENS.colors.mutedBorder,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    paddingBottom: 14
  },
  shareRecipientCard: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...softShadow({ blur: 14, color: TOKENS.colors.text, opacity: 0.04, y: 5 })
  },
  shareRecipientCopy: {
    flex: 1,
    minWidth: 0
  },
  shareRecipientIcon: {
    alignItems: "center",
    backgroundColor: TOKENS.colors.accentLight,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  shareRecipientInput: {
    color: APP_PURPLE_TEXT,
    fontSize: 17,
    fontWeight: "800",
    height: 30,
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 1,
    padding: 0,
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none"
        }
      : {})
  },
  shareRecipientLabel: {
    color: TOKENS.colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    lineHeight: 14,
    textTransform: "uppercase"
  },
  shareSubtitle: {
    color: APP_PURPLE_MUTED,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 315
  },
  shareTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
    marginTop: 7
  },
  shareGlyph: {
    height: 17,
    justifyContent: "center",
    position: "relative",
    width: 17
  },
  shareGlyphArrow: {
    color: TOKENS.colors.textInverse,
    fontSize: 19,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 19,
    position: "absolute",
    right: -1,
    top: -4
  },
  shareGlyphStem: {
    borderBottomColor: TOKENS.colors.surface,
    borderBottomWidth: 2,
    borderLeftColor: TOKENS.colors.surface,
    borderLeftWidth: 2,
    bottom: 2,
    height: 10,
    left: 1,
    position: "absolute",
    width: 10
  },
  splashContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 38
  },
  textButton: {
    marginTop: 64,
    padding: 8
  },
  textButtonLabel: {
    color: APP_PURPLE_MUTED,
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 0
  },
  subscreenHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 24,
    paddingTop: 10
  },
  subscreenActionArea: {
    flexGrow: 0,
    flexShrink: 0,
    height: 72,
    marginBottom: 8,
    paddingHorizontal: 24
  },
  subscreenBody: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden"
  },
  subscreenContentWithNav: {
    paddingBottom: 28
  },
  subscreenTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  detailThemePill: {
    backgroundColor: TOKENS.colors.accentLight,
    borderColor: TOKENS.colors.accentBorderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  detailThemePillText: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  themeChip: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  themeChipSelected: {
    backgroundColor: TOKENS.colors.accent,
    borderColor: TOKENS.colors.accent
  },
  themeChipText: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  themeChipTextSelected: {
    color: TOKENS.colors.textInverse
  },
  themeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  toolContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32
  },
  toolInfoCard: {
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.mutedBorder,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    ...softShadow({ blur: 30, opacity: 0.04, y: 10 })
  },
  toolInfoContent: {
    paddingBottom: 44,
    paddingHorizontal: 24,
    paddingTop: 28
  },
  toolInfoText: {
    color: TOKENS.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 24,
    marginTop: 14
  },
  toolInfoTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 39,
    marginTop: 34
  },
  toolEyebrow: {
    color: TOKENS.colors.accent,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 4
  },
  toolListHeader: {
    paddingBottom: 18,
    paddingTop: 22
  },
  toolPageTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 36
  },
  toolTitleBlock: {
    flex: 1,
    paddingRight: 14
  },
  toolTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  toolText: {
    color: TOKENS.colors.text,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 14
  },
  toolTitle: {
    color: APP_PURPLE_TEXT,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 45
  },
  verseText: {
    color: TOKENS.colors.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 23
  },
  wordmark: {
    color: TOKENS.colors.text,
    fontWeight: "700",
    includeFontPadding: true,
    letterSpacing: -0.3,
    overflow: "visible"
  },
  wordmarkCompact: {
    fontSize: 15,
    lineHeight: 15,
    overflow: "visible",
    width: 120
  },
  wordmarkLarge: {
    fontSize: 42,
    lineHeight: 38
  }
});

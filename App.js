import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import encouragements from "./src/data/encouragements.json";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const C = {
  bg:           "#F5F5F7",
  surface:      "#FFFFFF",
  text:         "#111111",
  textSoft:     "#6B7280",
  accent:       "#4F46E5",
  accentLight:  "#EEF2FF",
  accentBorder: "#C7D2FE",
  border:       "#E5E7EB",
  red:          "#EF4444",
  gold:         "#F59E0B",
};

const STORAGE_KEYS = {
  hasOnboarded:     "still.hasOnboarded",
  name:             "still.name",
  savedIds:         "still.savedIds",
  seenIds:          "still.seenIds",
  notificationTime: "still.notificationTime",
  reflections:      "still.reflections",
};

const SPLASH_MS = 1200;

const REMINDER_TIMES = [
  { label: "Morning", hour: 7 },
  { label: "Noon",    hour: 12 },
  { label: "Evening", hour: 19 },
  { label: "Night",   hour: 21 },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle(items) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function parseSeenIds(value) {
  if (!value) return new Set();
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

function parseStoredIds(value) {
  return parseSeenIds(value);
}

function parseReflections(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getDisplayName(name, fallbackName) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : fallbackName;
}

function renderTemplate(template, name, fallbackName) {
  return template.replace("{name}", getDisplayName(name, fallbackName));
}

function shareTextFor(item, recipientName) {
  const message = renderTemplate(item.encouragement_template, recipientName, item.fallback_name);
  return `${message}\n\n"${item.verse_text}"\n${item.verse_reference}, KJV\n\nShared from Still`;
}

function getUnseenQueue(seenIds) {
  const safe = seenIds instanceof Set ? seenIds : new Set();
  const unseen = encouragements.filter((item) => !safe.has(item.id));
  return shuffle(unseen.length > 0 ? unseen : encouragements);
}

async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleDaily(hour) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const item = encouragements[Math.floor(Math.random() * encouragements.length)];
  const body = item.verse_text.length > 90
    ? item.verse_text.slice(0, 87) + "…"
    : item.verse_text;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Still",
      body: `${item.verse_reference} — ${body}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute: 0,
      repeats: true,
    },
  });
}

async function cancelNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function Wordmark({ compact = false }) {
  return (
    <Text style={[styles.wordmark, compact ? styles.wordmarkCompact : styles.wordmarkLarge]}>
      Still
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
            autoCapitalize="words"
            autoCorrect={false}
            cursorColor={C.accent}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={C.textSoft}
            returnKeyType="done"
            selectionColor={C.accentBorder}
            style={styles.nameInput}
            value={name}
          />
        </View>

        <View style={styles.nameActions}>
          <Pressable
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
      <ActivityIndicator color={C.accent} />
    </View>
  );
}

function IconButton({ label, onPress, selected = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        selected && styles.iconButtonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.iconButtonLabel, selected && styles.iconButtonLabelSelected]}>
        {label}
      </Text>
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
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
    >
      {icon ? icon : null}
      <Text style={styles.actionButtonLabel}>{children}</Text>
    </Pressable>
  );
}

function EncouragementCard({
  height,
  isSaved,
  item,
  name,
  onOpenSaved,
  onOpenSettings,
  onShare,
  onToggleSaved,
}) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const len = message.length;
  const noteSize = len > 310 ? 20 : len > 245 ? 22 : 26;

  return (
    <View style={[styles.card, { height }]}>
      <View style={styles.cardHeader}>
        <Wordmark compact />
        <View style={styles.headerActions}>
          <ActionButton icon={<HeartGlyph />} onPress={onOpenSaved}>My Saved</ActionButton>
          <IconButton label="☰" onPress={onOpenSettings} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.encouragementText, { fontSize: noteSize, lineHeight: noteSize * 1.08 }]}>
          {message}
        </Text>
        <View style={styles.rule} />
        <Text style={styles.verseText}>
          {item.verse_text}{" "}
          <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <ActionButton icon={<HeartGlyph />} onPress={() => onToggleSaved(item.id)}>
          {isSaved ? "Saved" : "Save"}
        </ActionButton>
        <ActionButton icon={<ShareGlyph />} onPress={() => onShare(item)}>
          Share
        </ActionButton>
      </View>
    </View>
  );
}

function FeedScreen({
  initialSeenIds = new Set(),
  name,
  onOpenSaved,
  onOpenSettings,
  onShare,
  onSavedIdsChange,
  onSeenIdsChange,
  savedIds = new Set(),
}) {
  const { height } = useWindowDimensions();
  const [listHeight, setListHeight] = useState(0);
  const [queue, setQueue] = useState(() => getUnseenQueue(initialSeenIds));
  const safeSavedIds = savedIds instanceof Set ? savedIds : new Set();
  const seenIdsRef = useRef(new Set(initialSeenIds));
  const isAppendingRef = useRef(false);
  const queueIdsRef = useRef(new Set(queue.map((item) => item.id)));

  const toggleSaved = useCallback(
    async (id) => {
      const next = new Set(safeSavedIds);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      await AsyncStorage.setItem(STORAGE_KEYS.savedIds, JSON.stringify([...next]));
      onSavedIdsChange(next);
    },
    [onSavedIdsChange, safeSavedIds]
  );

  const persistSeenIds = useCallback(
    async (nextSeenIds) => {
      await AsyncStorage.setItem(STORAGE_KEYS.seenIds, JSON.stringify([...nextSeenIds]));
      onSeenIdsChange(new Set(nextSeenIds));
    },
    [onSeenIdsChange]
  );

  const markSeen = useCallback(
    (ids) => {
      const next = new Set(seenIdsRef.current);
      let changed = false;
      ids.forEach((id) => { if (!next.has(id)) { next.add(id); changed = true; } });
      if (!changed) return;
      seenIdsRef.current = next;
      persistSeenIds(next).catch(() => {});
    },
    [persistSeenIds]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const ids = viewableItems.map((e) => e.item?.id).filter(Boolean);
    markSeen(ids);
  }).current;

  const appendMore = useCallback(async () => {
    if (isAppendingRef.current) return;
    isAppendingRef.current = true;
    try {
      let nextItems = encouragements.filter(
        (item) => !seenIdsRef.current.has(item.id) && !queueIdsRef.current.has(item.id)
      );
      if (nextItems.length === 0) {
        seenIdsRef.current = new Set();
        queueIdsRef.current = new Set(queue.map((item) => item.id));
        await AsyncStorage.setItem(STORAGE_KEYS.seenIds, "[]");
        onSeenIdsChange(new Set());
        nextItems = encouragements.filter((item) => !queueIdsRef.current.has(item.id));
        if (nextItems.length === 0) { queueIdsRef.current = new Set(); nextItems = encouragements; }
      }
      const shuffled = shuffle(nextItems);
      shuffled.forEach((item) => queueIdsRef.current.add(item.id));
      setQueue((current) => [...current, ...shuffled]);
    } finally {
      isAppendingRef.current = false;
    }
  }, [onSeenIdsChange, queue]);

  const renderItem = useCallback(
    ({ item }) => (
      <EncouragementCard
        height={listHeight || height}
        isSaved={safeSavedIds.has(item.id)}
        item={item}
        name={name}
        onOpenSaved={onOpenSaved}
        onOpenSettings={onOpenSettings}
        onShare={onShare}
        onToggleSaved={toggleSaved}
      />
    ),
    [height, listHeight, name, onOpenSaved, onOpenSettings, onShare, safeSavedIds, toggleSaved]
  );

  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, []);

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum
        ListEmptyComponent={EmptyFeed}
        contentContainerStyle={styles.feedContent}
        data={queue}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        initialNumToRender={3}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={4}
        onEndReached={appendMore}
        onEndReachedThreshold={0.85}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        viewabilityConfig={viewabilityConfig}
        windowSize={5}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function BackHeader({ title, onBack }) {
  return (
    <View style={styles.subscreenHeader}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backButtonLabel}>←</Text>
      </Pressable>
      <Text style={styles.subscreenTitle}>{title}</Text>
    </View>
  );
}

function SavedScreen({ name, onBack, onOpenJournal, onShare, onToggleSaved, reflections, savedIds }) {
  const safeSavedIds = savedIds instanceof Set ? savedIds : new Set();
  const savedItems = encouragements.filter((item) => safeSavedIds.has(item.id));

  const renderItem = useCallback(
    ({ item }) => {
      const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
      const preview = reflections[item.id];

      return (
        <View style={styles.savedItem}>
          <Text style={styles.savedMessage}>{message}</Text>
          <View style={styles.savedRule} />
          <Text style={styles.savedVerse}>
            {item.verse_text}{" "}
            <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
          </Text>
          {preview ? (
            <Text style={styles.reflectionPreview} numberOfLines={2}>
              {preview.length > 100 ? preview.slice(0, 97) + "…" : preview}
            </Text>
          ) : null}
          <View style={styles.savedActions}>
            <ActionButton icon={<HeartGlyph />} onPress={() => onToggleSaved(item.id)}>
              Remove
            </ActionButton>
            <ActionButton onPress={() => onOpenJournal(item)}>Journal</ActionButton>
            <ActionButton icon={<ShareGlyph />} onPress={() => onShare(item)}>
              Share
            </ActionButton>
          </View>
        </View>
      );
    },
    [name, onOpenJournal, onShare, onToggleSaved, reflections]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <BackHeader onBack={onBack} title="Saved" />
      {savedItems.length === 0 ? (
        <View style={styles.emptySaved}>
          <Text style={styles.emptySavedText}>No saved notes yet.</Text>
          <Text style={styles.emptySavedSub}>Save an encouragement from the feed.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.savedList}
          data={savedItems}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function SettingsScreen({
  name,
  notificationTime,
  onBack,
  onClearSaved,
  onResetSeen,
  onSave,
  onSetNotificationTime,
  onToggleNotification,
}) {
  const [draftName, setDraftName] = useState(name);
  const isNotifEnabled = notificationTime !== null;
  const selectedHour = notificationTime !== null ? parseInt(notificationTime, 10) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.settingsContent}
      >
        <BackHeader onBack={onBack} title="Profile" />

        <ScrollView
          contentContainerStyle={styles.settingsBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.settingsTitle}>Your{"\n"}name</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            cursorColor={C.accent}
            onChangeText={setDraftName}
            placeholder="Christian"
            placeholderTextColor={C.textSoft}
            returnKeyType="done"
            selectionColor={C.accentBorder}
            style={styles.nameInput}
            value={draftName}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => onSave(draftName)}
            style={({ pressed }) => [styles.saveNameButton, pressed && styles.pressed]}
          >
            <Text style={styles.saveNameButtonLabel}>Save</Text>
          </Pressable>

          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Daily Reminder</Text>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isNotifEnabled }}
              onPress={onToggleNotification}
              style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
            >
              <Text style={styles.profileText}>Send a daily verse reminder</Text>
              <View style={[styles.togglePill, isNotifEnabled && styles.togglePillOn]}>
                <View style={[styles.toggleKnob, isNotifEnabled && styles.toggleKnobOn]} />
              </View>
            </Pressable>
            {isNotifEnabled && (
              <View style={styles.timeChips}>
                {REMINDER_TIMES.map((t) => (
                  <Pressable
                    key={t.label}
                    onPress={() => onSetNotificationTime(t.hour)}
                    style={({ pressed }) => [
                      styles.timeChip,
                      selectedHour === t.hour && styles.timeChipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[
                      styles.timeChipLabel,
                      selectedHour === t.hour && styles.timeChipLabelSelected,
                    ]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>About</Text>
            <Text style={styles.profileText}>
              Still is a quiet place for Christ-centered encouragement. Each note is paired with a King James Version Bible verse and is meant to point your heart back to Jesus.
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Privacy</Text>
            <Text style={styles.profileText}>
              Your name, saved notes, journal reflections, and reading history stay on this device. Still does not use accounts, ads, analytics, or tracking.
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Care note</Text>
            <Text style={styles.profileText}>
              These notes are for spiritual encouragement and are not a replacement for pastoral, medical, mental health, or emergency care.
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Controls</Text>
            <View style={styles.controlActions}>
              <ActionButton onPress={onResetSeen}>Reset Seen Notes</ActionButton>
              <ActionButton onPress={onClearSaved}>Clear Saved Notes</ActionButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function SharePreviewScreen({ item, onBack, onShare }) {
  const [recipientName, setRecipientName] = useState("");
  const message = item ? shareTextFor(item, recipientName) : "";

  if (!item) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.shareContent}
      >
        <BackHeader onBack={onBack} title="Share" />

        <View style={styles.shareBody}>
          <Text style={styles.shareTitle}>Who{"'"}s this for?</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            cursorColor={C.accent}
            onChangeText={setRecipientName}
            placeholder="Leave blank for Christian"
            placeholderTextColor={C.textSoft}
            returnKeyType="done"
            selectionColor={C.accentBorder}
            style={styles.nameInput}
            value={recipientName}
          />

          <Text style={styles.sharePreviewLabel}>Preview</Text>
          <View style={styles.sharePreviewBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sharePreviewText}>{message}</Text>
            </ScrollView>
          </View>

          <View style={styles.shareActions}>
            <ActionButton onPress={() => onShare(message)}>Share</ActionButton>
          </View>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function JournalScreen({ item, name, reflection, onBack, onSave }) {
  const [text, setText] = useState(reflection || "");
  const hasChanged = text !== (reflection || "");
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);

  const handleBack = useCallback(() => {
    if (hasChanged) {
      Alert.alert("Discard changes?", "Your reflection will not be saved.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: onBack },
      ]);
    } else {
      onBack();
    }
  }, [hasChanged, onBack]);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <BackHeader onBack={handleBack} title="Journal" />
        <ScrollView
          contentContainerStyle={styles.journalBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.journalCard}>
            <Text style={styles.journalMessage}>{message}</Text>
            <View style={styles.savedRule} />
            <Text style={styles.savedVerse}>
              {item.verse_text}{" "}
              <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
            </Text>
          </View>

          <Text style={styles.journalLabel}>Your reflection</Text>
          <TextInput
            multiline
            cursorColor={C.accent}
            onChangeText={setText}
            placeholder="Write your thoughts…"
            placeholderTextColor={C.textSoft}
            selectionColor={C.accentBorder}
            style={styles.journalInput}
            textAlignVertical="top"
            value={text}
          />

          <View style={styles.journalActions}>
            <ActionButton onPress={() => onSave(text)}>Save</ActionButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AppContent() {
  const [isBooting, setIsBooting]               = useState(true);
  const [hasOnboarded, setHasOnboarded]         = useState(false);
  const [name, setName]                         = useState("");
  const [savedIds, setSavedIds]                 = useState(new Set());
  const [seenIds, setSeenIds]                   = useState(new Set());
  const [reflections, setReflections]           = useState({});
  const [notificationTime, setNotificationTime] = useState(null);
  const [screen, setScreen]                     = useState("feed");
  const [shareItem, setShareItem]               = useState(null);
  const [shareReturnScreen, setShareReturnScreen] = useState("feed");
  const [journalItem, setJournalItem]           = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const startTime = Date.now();
      try {
        const stored = Object.fromEntries(
          await AsyncStorage.multiGet([
            STORAGE_KEYS.hasOnboarded,
            STORAGE_KEYS.name,
            STORAGE_KEYS.savedIds,
            STORAGE_KEYS.seenIds,
            STORAGE_KEYS.notificationTime,
            STORAGE_KEYS.reflections,
          ])
        );
        const remaining = Math.max(SPLASH_MS - (Date.now() - startTime), 0);
        await delay(remaining);
        if (!isMounted) return;

        setHasOnboarded(stored[STORAGE_KEYS.hasOnboarded] === "true");
        setName(stored[STORAGE_KEYS.name] ?? "");
        setSavedIds(parseStoredIds(stored[STORAGE_KEYS.savedIds]));
        setSeenIds(parseSeenIds(stored[STORAGE_KEYS.seenIds]));
        setNotificationTime(stored[STORAGE_KEYS.notificationTime] ?? null);
        setReflections(parseReflections(stored[STORAGE_KEYS.reflections]));
      } catch {
        if (isMounted) setHasOnboarded(false);
      } finally {
        if (isMounted) setIsBooting(false);
      }
    }

    bootstrap();
    return () => { isMounted = false; };
  }, []);

  const continueToFeed = useCallback(async (nextName) => {
    const trimmed = nextName.trim();
    setName(trimmed);
    setHasOnboarded(true);
    setScreen("feed");
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.name, trimmed],
      [STORAGE_KEYS.hasOnboarded, "true"],
    ]);
  }, []);

  const saveProfileName = useCallback(async (nextName) => {
    const trimmed = nextName.trim();
    setName(trimmed);
    await AsyncStorage.setItem(STORAGE_KEYS.name, trimmed);
    setScreen("feed");
  }, []);

  const toggleSaved = useCallback(
    async (id) => {
      const next = new Set(savedIds);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      await AsyncStorage.setItem(STORAGE_KEYS.savedIds, JSON.stringify([...next]));
      setSavedIds(next);
    },
    [savedIds]
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
            await AsyncStorage.setItem(STORAGE_KEYS.seenIds, "[]");
            setSeenIds(new Set());
            setScreen("feed");
          },
        },
      ]
    );
  }, []);

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
            await AsyncStorage.setItem(STORAGE_KEYS.savedIds, "[]");
            setSavedIds(new Set());
            setScreen("feed");
          },
        },
      ]
    );
  }, []);

  const requestShare = useCallback(
    (item) => {
      setShareReturnScreen(screen === "saved" ? "saved" : "feed");
      setShareItem(item);
      setScreen("share");
    },
    [screen]
  );

  const closeShare = useCallback(() => {
    setShareItem(null);
    setScreen(shareReturnScreen);
  }, [shareReturnScreen]);

  const shareEncouragement = useCallback(async (message) => {
    try {
      await Share.share({ message, title: "Still" });
    } catch {
      Alert.alert("Share did not open", "Please try closing and reopening the app, then share again.");
    }
  }, []);

  const handleToggleNotification = useCallback(async () => {
    if (notificationTime !== null) {
      await cancelNotifications();
      await AsyncStorage.removeItem(STORAGE_KEYS.notificationTime);
      setNotificationTime(null);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDaily(7);
        await AsyncStorage.setItem(STORAGE_KEYS.notificationTime, "7");
        setNotificationTime("7");
      } else {
        Alert.alert(
          "Permission needed",
          "Enable notifications in Settings to receive daily reminders."
        );
      }
    }
  }, [notificationTime]);

  const handleSetNotificationTime = useCallback(async (hour) => {
    await scheduleDaily(hour);
    const timeStr = String(hour);
    await AsyncStorage.setItem(STORAGE_KEYS.notificationTime, timeStr);
    setNotificationTime(timeStr);
  }, []);

  const openJournal = useCallback((item) => {
    setJournalItem(item);
    setScreen("journal");
  }, []);

  const saveReflection = useCallback(
    async (text) => {
      const next = { ...reflections };
      if (text.trim()) {
        next[journalItem.id] = text.trim();
      } else {
        delete next[journalItem.id];
      }
      await AsyncStorage.setItem(STORAGE_KEYS.reflections, JSON.stringify(next));
      setReflections(next);
      setJournalItem(null);
      setScreen("saved");
    },
    [journalItem, reflections]
  );

  if (isBooting) return <SplashScreen />;

  if (!hasOnboarded) {
    return <NameScreen initialName={name} onContinue={continueToFeed} />;
  }

  if (screen === "journal") {
    return (
      <JournalScreen
        item={journalItem}
        name={name}
        reflection={journalItem ? reflections[journalItem.id] || "" : ""}
        onBack={() => { setJournalItem(null); setScreen("saved"); }}
        onSave={saveReflection}
      />
    );
  }

  if (screen === "saved") {
    return (
      <SavedScreen
        name={name}
        onBack={() => setScreen("feed")}
        onOpenJournal={openJournal}
        onShare={requestShare}
        onToggleSaved={toggleSaved}
        reflections={reflections}
        savedIds={savedIds}
      />
    );
  }

  if (screen === "share") {
    return (
      <SharePreviewScreen
        item={shareItem}
        onBack={closeShare}
        onShare={shareEncouragement}
      />
    );
  }

  if (screen === "settings") {
    return (
      <SettingsScreen
        name={name}
        notificationTime={notificationTime}
        onBack={() => setScreen("feed")}
        onClearSaved={clearSavedNotes}
        onResetSeen={resetSeenNotes}
        onSave={saveProfileName}
        onSetNotificationTime={handleSetNotificationTime}
        onToggleNotification={handleToggleNotification}
      />
    );
  }

  return (
    <FeedScreen
      initialSeenIds={seenIds}
      name={name}
      onOpenSaved={() => setScreen("saved")}
      onOpenSettings={() => setScreen("settings")}
      onSavedIdsChange={setSavedIds}
      onSeenIdsChange={setSeenIds}
      onShare={requestShare}
      savedIds={savedIds}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: C.text,
    borderRadius: 24,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
    minWidth: 108,
    paddingHorizontal: 16,
  },
  actionButtonLabel: {
    color: C.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  arrowButton: {
    alignItems: "center",
    backgroundColor: C.accentLight,
    borderColor: C.accentBorder,
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  arrowButtonLabel: {
    color: C.accent,
    fontSize: 27,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 29,
    marginTop: -1,
  },
  arrowButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  backButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  backButtonLabel: {
    color: C.text,
    fontSize: 28,
    lineHeight: 30,
  },
  card: {
    backgroundColor: C.surface,
    paddingBottom: 42,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 28,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "flex-end",
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controlActions: {
    alignItems: "flex-start",
    gap: 10,
  },
  emptySaved: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptySavedSub: {
    color: C.textSoft,
    fontSize: 15,
    fontStyle: "italic",
    marginTop: 6,
    textAlign: "center",
  },
  emptySavedText: {
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center",
  },
  encouragementText: {
    color: C.text,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  feedContent: {
    backgroundColor: C.surface,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  heartGlyph: {
    color: C.red,
    fontSize: 18,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 20,
  },
  iconButton: {
    alignItems: "center",
    borderColor: C.text,
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconButtonLabel: {
    color: C.text,
    fontSize: 20,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 22,
  },
  iconButtonLabelSelected: {
    color: C.surface,
  },
  iconButtonSelected: {
    backgroundColor: C.text,
  },
  journalActions: {
    alignItems: "flex-end",
    marginTop: 18,
  },
  journalBody: {
    paddingBottom: 44,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  journalCard: {
    backgroundColor: C.accentLight,
    borderRadius: 10,
    marginBottom: 24,
    padding: 16,
  },
  journalInput: {
    backgroundColor: C.surface,
    borderColor: C.border,
    borderRadius: 8,
    borderWidth: 1.5,
    color: C.text,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    padding: 14,
  },
  journalLabel: {
    color: C.textSoft,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 8,
  },
  journalMessage: {
    color: C.text,
    fontSize: 18,
    lineHeight: 22,
  },
  loadingFeed: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 640,
  },
  nameActions: {
    alignItems: "center",
    gap: 16,
  },
  nameContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  nameInput: {
    backgroundColor: C.accentLight,
    borderRadius: 7,
    color: C.text,
    fontSize: 14,
    fontStyle: "italic",
    height: 38,
    letterSpacing: 1.4,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  nameTitle: {
    color: C.text,
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 43,
  },
  pressed: {
    opacity: 0.6,
  },
  profileSection: {
    marginTop: 30,
  },
  profileSectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 21,
    marginBottom: 7,
  },
  profileText: {
    color: C.text,
    fontSize: 15,
    lineHeight: 20,
    maxWidth: 320,
  },
  referenceText: {
    color: C.accent,
    fontStyle: "italic",
  },
  reflectionPreview: {
    color: C.textSoft,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: 8,
  },
  rule: {
    backgroundColor: C.border,
    height: 1,
    marginBottom: 9,
    marginTop: 14,
    width: 46,
  },
  saveNameButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: C.accentLight,
    borderColor: C.accentBorder,
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 24,
  },
  saveNameButtonLabel: {
    color: C.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  savedActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    justifyContent: "flex-end",
    marginTop: 16,
  },
  savedItem: {
    borderBottomColor: C.border,
    borderBottomWidth: 1,
    paddingBottom: 26,
    paddingTop: 26,
  },
  savedList: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  savedMessage: {
    color: C.text,
    fontSize: 21,
    lineHeight: 22,
  },
  savedRule: {
    backgroundColor: C.border,
    height: 1,
    marginBottom: 9,
    marginTop: 14,
    width: 46,
  },
  savedVerse: {
    color: C.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 17,
  },
  screen: {
    backgroundColor: C.bg,
    flex: 1,
  },
  settingsBody: {
    paddingBottom: 44,
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    color: C.text,
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 43,
  },
  shareActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  shareBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 42,
  },
  shareContent: {
    flex: 1,
  },
  shareGlyph: {
    height: 17,
    justifyContent: "center",
    position: "relative",
    width: 17,
  },
  shareGlyphArrow: {
    color: C.gold,
    fontSize: 19,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 19,
    position: "absolute",
    right: -1,
    top: -4,
  },
  shareGlyphStem: {
    borderBottomColor: C.gold,
    borderBottomWidth: 2,
    borderLeftColor: C.gold,
    borderLeftWidth: 2,
    bottom: 2,
    height: 10,
    left: 1,
    position: "absolute",
    width: 10,
  },
  sharePreviewBox: {
    borderColor: C.border,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 8,
    maxHeight: 300,
    padding: 16,
  },
  sharePreviewLabel: {
    color: C.textSoft,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 24,
  },
  sharePreviewText: {
    color: C.text,
    fontSize: 16,
    lineHeight: 19,
  },
  shareTitle: {
    color: C.text,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
    marginBottom: 12,
  },
  splashContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 38,
  },
  subscreenHeader: {
    alignItems: "center",
    borderBottomColor: C.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingBottom: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  subscreenTitle: {
    color: C.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  textButton: {
    marginTop: 64,
    padding: 8,
  },
  textButtonLabel: {
    color: C.text,
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 0,
  },
  timeChip: {
    backgroundColor: C.surface,
    borderColor: C.border,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  timeChipLabel: {
    color: C.text,
    fontSize: 14,
    fontWeight: "500",
  },
  timeChipLabelSelected: {
    color: C.accent,
    fontWeight: "700",
  },
  timeChipSelected: {
    backgroundColor: C.accentLight,
    borderColor: C.accentBorder,
  },
  timeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  toggleKnob: {
    backgroundColor: C.surface,
    borderRadius: 11,
    height: 22,
    width: 22,
  },
  toggleKnobOn: {
    transform: [{ translateX: 22 }],
  },
  togglePill: {
    backgroundColor: C.border,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    padding: 3,
    width: 50,
  },
  togglePillOn: {
    backgroundColor: C.accent,
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 4,
  },
  verseText: {
    color: C.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 17,
  },
  wordmark: {
    color: C.text,
    fontWeight: "900",
    letterSpacing: 0,
  },
  wordmarkCompact: {
    fontSize: 16,
    lineHeight: 16,
  },
  wordmarkLarge: {
    fontSize: 64,
    lineHeight: 60,
  },
});

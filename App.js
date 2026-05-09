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

const STORAGE_KEYS = {
  hasOnboarded: "twc.hasOnboarded",
  name: "twc.name",
  savedIds: "twc.savedIds",
  seenIds: "twc.seenIds"
};

const SPLASH_MS = 1200;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function parseStoredIds(value) {
  return parseSeenIds(value);
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

  return `${message}\n\n"${item.verse_text}"\n${item.verse_reference}, KJV\n\nShared from The Weak Christian`;
}

function getUnseenQueue(seenIds) {
  const safeSeenIds = seenIds instanceof Set ? seenIds : new Set();
  const unseen = encouragements.filter((item) => !safeSeenIds.has(item.id));
  return shuffle(unseen.length > 0 ? unseen : encouragements);
}

function Wordmark({ compact = false }) {
  return (
    <Text style={[styles.wordmark, compact ? styles.wordmarkCompact : styles.wordmarkLarge]}>
      The{"\n"}Weak{"\n"}Christian
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
            cursorColor="#5147E8"
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor="#8D899B"
            returnKeyType="done"
            selectionColor="#C8C3F6"
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
      <ActivityIndicator color="#5147E8" />
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
  onToggleSaved
}) {
  const message = renderTemplate(item.encouragement_template, name, item.fallback_name);
  const noteLength = message.length;
  const noteSize = noteLength > 310 ? 20 : noteLength > 245 ? 22 : 24;

  return (
    <View style={[styles.card, { height }]}>
      <View style={styles.cardHeader}>
        <Wordmark compact />

        <View style={styles.headerActions}>
          <ActionButton icon={<HeartGlyph />} onPress={onOpenSaved}>My Saved Notes</ActionButton>
          <IconButton label="☰" onPress={onOpenSettings} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.encouragementText, { fontSize: noteSize, lineHeight: noteSize * 1.05 }]}>
          {message}
        </Text>

        <View style={styles.rule} />

        <Text style={styles.verseText}>
          {item.verse_text} <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
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
  savedIds = new Set()
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
      const nextSavedIds = new Set(safeSavedIds);

      if (nextSavedIds.has(id)) {
        nextSavedIds.delete(id);
      } else {
        nextSavedIds.add(id);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.savedIds, JSON.stringify([...nextSavedIds]));
      onSavedIdsChange(nextSavedIds);
    },
    [onSavedIdsChange, safeSavedIds]
  );

  const persistSeenIds = useCallback(
    async (nextSeenIds) => {
      const nextValue = JSON.stringify([...nextSeenIds]);
      await AsyncStorage.setItem(STORAGE_KEYS.seenIds, nextValue);
      onSeenIdsChange(new Set(nextSeenIds));
    },
    [onSeenIdsChange]
  );

  const markSeen = useCallback(
    (ids) => {
      const nextSeenIds = new Set(seenIdsRef.current);
      let changed = false;

      ids.forEach((id) => {
        if (!nextSeenIds.has(id)) {
          nextSeenIds.add(id);
          changed = true;
        }
      });

      if (!changed) {
        return;
      }

      seenIdsRef.current = nextSeenIds;
      persistSeenIds(nextSeenIds).catch(() => {});
    },
    [persistSeenIds]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const ids = viewableItems.map((entry) => entry.item?.id).filter(Boolean);
    markSeen(ids);
  }).current;

  const appendMore = useCallback(async () => {
    if (isAppendingRef.current) {
      return;
    }

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

        if (nextItems.length === 0) {
          queueIdsRef.current = new Set();
          nextItems = encouragements;
        }
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
        onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}
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

function SavedScreen({ name, onBack, onShare, onToggleSaved, savedIds }) {
  const safeSavedIds = savedIds instanceof Set ? savedIds : new Set();
  const savedItems = encouragements.filter((item) => safeSavedIds.has(item.id));

  const renderItem = useCallback(
    ({ item }) => {
      const message = renderTemplate(item.encouragement_template, name, item.fallback_name);

      return (
        <View style={styles.savedItem}>
          <Text style={styles.savedMessage}>{message}</Text>
          <View style={styles.savedRule} />
          <Text style={styles.savedVerse}>
            {item.verse_text} <Text style={styles.referenceText}>{item.verse_reference}, KJV</Text>
          </Text>
          <View style={styles.savedActions}>
            <ActionButton icon={<HeartGlyph />} onPress={() => onToggleSaved(item.id)}>
              Remove
            </ActionButton>
            <ActionButton icon={<ShareGlyph />} onPress={() => onShare(item)}>
              Share
            </ActionButton>
          </View>
        </View>
      );
    },
    [name, onShare, onToggleSaved]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <BackHeader onBack={onBack} title="Saved" />
      {savedItems.length === 0 ? (
        <View style={styles.emptySaved}>
          <Text style={styles.emptySavedText}>No saved encouragements yet.</Text>
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

function SettingsScreen({ name, onBack, onClearSaved, onResetSeen, onSave }) {
  const [draftName, setDraftName] = useState(name);

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
            cursorColor="#5147E8"
            onChangeText={setDraftName}
            placeholder="Christian"
            placeholderTextColor="#8D899B"
            returnKeyType="done"
            selectionColor="#C8C3F6"
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
            <Text style={styles.profileSectionTitle}>About</Text>
            <Text style={styles.profileText}>
              The Weak Christian is a quiet place for Christ-centered encouragement. Each note is paired with a King James Version Bible verse and is meant to point your heart back to Jesus.
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Privacy</Text>
            <Text style={styles.profileText}>
              Your name, saved notes, and reading history stay on this device. The app does not use accounts, ads, analytics, or tracking.
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

  if (!item) {
    return null;
  }

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
            cursorColor="#5147E8"
            onChangeText={setRecipientName}
            placeholder="Leave blank for Christian"
            placeholderTextColor="#8D899B"
            returnKeyType="done"
            selectionColor="#C8C3F6"
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

function AppContent() {
  const [isBooting, setIsBooting] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [name, setName] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());
  const [seenIds, setSeenIds] = useState(new Set());
  const [screen, setScreen] = useState("feed");
  const [shareItem, setShareItem] = useState(null);
  const [shareReturnScreen, setShareReturnScreen] = useState("feed");

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const startTime = Date.now();

      try {
        const storedValues = await AsyncStorage.multiGet([
          STORAGE_KEYS.hasOnboarded,
          STORAGE_KEYS.name,
          STORAGE_KEYS.savedIds,
          STORAGE_KEYS.seenIds
        ]);
        const stored = Object.fromEntries(storedValues);
        const remainingSplashMs = Math.max(SPLASH_MS - (Date.now() - startTime), 0);

        await delay(remainingSplashMs);

        if (!isMounted) {
          return;
        }

        setHasOnboarded(stored[STORAGE_KEYS.hasOnboarded] === "true");
        setName(stored[STORAGE_KEYS.name] ?? "");
        setSavedIds(parseStoredIds(stored[STORAGE_KEYS.savedIds]));
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

    setName(trimmedName);
    setHasOnboarded(true);
    setScreen("feed");

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.name, trimmedName],
      [STORAGE_KEYS.hasOnboarded, "true"]
    ]);
  }, []);

  const saveProfileName = useCallback(async (nextName) => {
    const trimmedName = nextName.trim();
    setName(trimmedName);
    await AsyncStorage.setItem(STORAGE_KEYS.name, trimmedName);
    setScreen("feed");
  }, []);

  const toggleSaved = useCallback(
    async (id) => {
      const nextSavedIds = new Set(savedIds);

      if (nextSavedIds.has(id)) {
        nextSavedIds.delete(id);
      } else {
        nextSavedIds.add(id);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.savedIds, JSON.stringify([...nextSavedIds]));
      setSavedIds(nextSavedIds);
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
          }
        }
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
          }
        }
      ]
    );
  }, []);

  const requestShare = useCallback((item) => {
    setShareReturnScreen(screen === "saved" ? "saved" : "feed");
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
          title: "The Weak Christian"
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

  if (isBooting) {
    return <SplashScreen />;
  }

  if (!hasOnboarded) {
    return <NameScreen initialName={name} onContinue={continueToFeed} />;
  }

  if (screen === "saved") {
    return (
      <SavedScreen
        name={name}
        onBack={() => setScreen("feed")}
        onShare={requestShare}
        onToggleSaved={toggleSaved}
        savedIds={savedIds}
      />
    );
  }

  if (screen === "share") {
    return <SharePreviewScreen item={shareItem} onBack={closeShare} onShare={shareEncouragement} />;
  }

  if (screen === "settings") {
    return (
      <SettingsScreen
        name={name}
        onBack={() => setScreen("feed")}
        onClearSaved={clearSavedNotes}
        onResetSeen={resetSeenNotes}
        onSave={saveProfileName}
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
    backgroundColor: "#050505",
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    height: 42,
    justifyContent: "center",
    minWidth: 108,
    paddingHorizontal: 16
  },
  actionButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0
  },
  actionButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  },
  arrowButton: {
    alignItems: "center",
    backgroundColor: "#E9E6FF",
    borderColor: "#D8D4FF",
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  arrowButtonLabel: {
    color: "#5147E8",
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
    height: 42,
    justifyContent: "center",
    width: 42
  },
  backButtonLabel: {
    color: "#050505",
    fontSize: 28,
    lineHeight: 30
  },
  card: {
    backgroundColor: "#FFFFFF",
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
  emptySaved: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32
  },
  emptySavedText: {
    color: "#050505",
    fontSize: 20,
    lineHeight: 24
  },
  encouragementText: {
    color: "#050505",
    fontWeight: "400",
    letterSpacing: 0
  },
  feedContent: {
    backgroundColor: "#FFFFFF"
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
  iconButton: {
    alignItems: "center",
    borderColor: "#050505",
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  iconButtonLabel: {
    color: "#050505",
    fontSize: 20,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 22
  },
  iconButtonLabelSelected: {
    color: "#FFFFFF"
  },
  iconButtonSelected: {
    backgroundColor: "#050505"
  },
  loadingFeed: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 640
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
    color: "#050505",
    fontSize: 14,
    fontStyle: "italic"
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#050505",
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 24,
    padding: 22
  },
  modalOverlay: {
    backgroundColor: "rgba(255,255,255,0.86)",
    flex: 1,
    justifyContent: "center"
  },
  modalTitle: {
    color: "#050505",
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
    backgroundColor: "#DEDCF4",
    borderRadius: 7,
    color: "#050505",
    fontSize: 14,
    fontStyle: "italic",
    height: 38,
    letterSpacing: 1.4,
    marginTop: 8,
    paddingHorizontal: 12
  },
  nameTitle: {
    color: "#050505",
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 43
  },
  pressed: {
    opacity: 0.6
  },
  referenceText: {
    color: "#5147E8",
    fontStyle: "italic"
  },
  rule: {
    backgroundColor: "#050505",
    height: 2,
    marginBottom: 9,
    marginTop: 14,
    width: 46
  },
  saveNameButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E9E6FF",
    borderColor: "#D8D4FF",
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 24
  },
  saveNameButtonLabel: {
    color: "#5147E8",
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
  savedItem: {
    borderBottomColor: "#D8D8D8",
    borderBottomWidth: 1,
    paddingBottom: 26,
    paddingTop: 26
  },
  savedList: {
    paddingBottom: 40,
    paddingHorizontal: 24
  },
  savedMessage: {
    color: "#050505",
    fontSize: 21,
    lineHeight: 22
  },
  savedRule: {
    backgroundColor: "#050505",
    height: 2,
    marginBottom: 9,
    marginTop: 14,
    width: 46
  },
  savedVerse: {
    color: "#050505",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 17
  },
  screen: {
    backgroundColor: "#FFFFFF",
    flex: 1
  },
  controlActions: {
    alignItems: "flex-start",
    gap: 10
  },
  profileSection: {
    marginTop: 30
  },
  profileSectionTitle: {
    color: "#050505",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 21,
    marginBottom: 7
  },
  profileText: {
    color: "#050505",
    fontSize: 15,
    lineHeight: 20,
    maxWidth: 320
  },
  settingsBody: {
    paddingBottom: 44,
    paddingHorizontal: 36,
    paddingTop: 40
  },
  settingsContent: {
    flex: 1
  },
  settingsTitle: {
    color: "#050505",
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 43
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
    paddingTop: 42
  },
  shareContent: {
    flex: 1
  },
  sharePreviewBox: {
    borderColor: "#050505",
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 8,
    maxHeight: 300,
    padding: 16
  },
  sharePreviewLabel: {
    color: "#050505",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 24
  },
  sharePreviewText: {
    color: "#050505",
    fontSize: 16,
    lineHeight: 19
  },
  shareTitle: {
    color: "#050505",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
    marginBottom: 12
  },
  shareGlyph: {
    height: 17,
    justifyContent: "center",
    position: "relative",
    width: 17
  },
  shareGlyphArrow: {
    color: "#FFD23F",
    fontSize: 19,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 19,
    position: "absolute",
    right: -1,
    top: -4
  },
  shareGlyphStem: {
    borderBottomColor: "#FFD23F",
    borderBottomWidth: 2,
    borderLeftColor: "#FFD23F",
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
    color: "#050505",
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 0
  },
  subscreenHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 8
  },
  subscreenTitle: {
    color: "#050505",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  verseText: {
    color: "#050505",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 17
  },
  wordmark: {
    color: "#050505",
    fontWeight: "900",
    letterSpacing: 0
  },
  wordmarkCompact: {
    fontSize: 13,
    lineHeight: 12
  },
  wordmarkLarge: {
    fontSize: 42,
    lineHeight: 38
  }
});

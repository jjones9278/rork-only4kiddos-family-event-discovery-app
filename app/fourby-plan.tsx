import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, RefreshControl,
} from 'react-native';
import { Star, ThumbsUp, ThumbsDown, ExternalLink, Sparkles } from 'lucide-react-native';
import { AuthGuard } from '@/components/AuthGuard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { BrandedButton } from '@/components/BrandedButton';
import { useToastHelpers } from '@/components/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import {
  useFourbyPlan, saveFourbyFeedback, FourbyItem, FourbyFeedbackUpdate, FourbyPlan,
} from '@/hooks/use-events-laravel';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

const WEBSITE_PLAN_URL = 'https://only4kiddos.com/homeschool/plan';
const COMMENT_MAX = 1000;

const SECTIONS: { category: string; title: string }[] = [
  { category: 'curriculum', title: '📚 Curriculum' },
  { category: 'local_activity', title: '📍 Local activities' },
  { category: 'co_op', title: '🤝 Co-ops' },
  { category: 'partner_discount', title: '🎟️ Partner discounts' },
];

function openSafely(url: string | null) {
  if (url && /^https?:\/\//i.test(url)) Linking.openURL(url).catch(() => {});
}

export default function FourbyPlanScreen() {
  return (
    <AuthGuard>
      <SignedInPlan />
    </AuthGuard>
  );
}

function SignedInPlan() {
  const { user } = useAuth();
  return <FourbyPlanView enabled={!!user} email={user?.email ?? null} />;
}

// Auth-free view (takes what it needs as props), so it can be previewed without Firebase.
export function FourbyPlanView({ enabled, email }: { enabled: boolean; email: string | null }) {
  const { data, isLoading, isError, unavailable, refetch, setData } = useFourbyPlan(enabled);
  const { toastError } = useToastHelpers();

  // Optimistic: show the change now, swap in the server's copy, roll back on failure.
  const save = async (item: FourbyItem, update: FourbyFeedbackUpdate) => {
    const before = item;
    const optimistic: FourbyItem = { ...item, feedback: { ...item.feedback, ...update } };
    if (update.helpful === true) optimistic.feedback.reason = null; // server does the same
    replaceItem(setData, optimistic);
    try {
      replaceItem(setData, await saveFourbyFeedback(item.id, update));
      return true;
    } catch (e) {
      replaceItem(setData, before);
      toastError("Couldn't save that", (e as Error).message || 'Please try again.');
      return false;
    }
  };

  if (isLoading && !data) return <LoadingState label="Loading your Fourby plan..." />;
  if (unavailable) {
    return <Notice title="Coming soon" body="Fourby plans aren't available in the app yet. Check back after the next update." />;
  }
  if (isError || !data) return <ErrorState message="We couldn't load your Fourby plan." onRetry={refetch} />;
  if (!data.linked) return <NotLinked plan={data} email={email} onRefresh={refetch} />;
  if (data.planStatus === 'pending') {
    return <Notice title="Fourby is still building your plan" body="This usually takes under a minute." actionLabel="Check again" onAction={refetch} />;
  }
  if (data.items.length === 0) {
    return (
      <Notice
        title="No suggestions to show yet"
        body="Open your plan on only4kiddos.com to see it, or regenerate it there."
        actionLabel="Open on the website"
        onAction={() => openSafely(WEBSITE_PLAN_URL)}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
    >
      <View style={styles.hero}>
        <Sparkles size={22} color={Colors.primary} />
        <Text style={styles.heroTitle}>Your Fourby plan</Text>
        <Text style={styles.heroBody}>Rate each suggestion so Fourby can get better at picking for your family.</Text>
      </View>
      <PlanSections plan={data} onSave={save} />
    </ScrollView>
  );
}

function replaceItem(setData: React.Dispatch<React.SetStateAction<FourbyPlan | null>>, item: FourbyItem) {
  setData((prev) => prev && { ...prev, items: prev.items.map((i) => (i.id === item.id ? item : i)) });
}

function PlanSections({ plan, onSave }: { plan: FourbyPlan; onSave: (i: FourbyItem, u: FourbyFeedbackUpdate) => Promise<boolean> }) {
  const known = new Set(SECTIONS.map((s) => s.category));
  const sections = [
    ...SECTIONS,
    ...(plan.items.some((i) => !known.has(i.category)) ? [{ category: '*', title: '✨ More suggestions' }] : []),
  ];

  return (
    <>
      {sections.map(({ category, title }) => {
        const items = plan.items.filter((i) => (category === '*' ? !known.has(i.category) : i.category === category));
        if (items.length === 0) return null;

        // Curriculum is per child: keep the order items arrived in, add a child label when it changes.
        let lastChild: string | null | undefined;
        return (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item) => {
              const showChild = category === 'curriculum' && item.childName !== lastChild;
              lastChild = item.childName;
              return (
                <View key={item.id}>
                  {showChild && <Text style={styles.childBand}>{item.childName ?? 'Your family'}</Text>}
                  <PlanCard item={item} reasons={plan.reasons} onSave={onSave} />
                </View>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

function PlanCard({ item, reasons, onSave }: {
  item: FourbyItem;
  reasons: FourbyPlan['reasons'];
  onSave: (i: FourbyItem, u: FourbyFeedbackUpdate) => Promise<boolean>;
}) {
  const { rating, helpful, reason, comment } = item.feedback;
  const [draft, setDraft] = useState(comment ?? '');
  const [savingNote, setSavingNote] = useState(false);
  const saved = comment ?? '';
  const trimmed = draft.trim();

  const label = useMemo(() => {
    if (helpful === null) return 'Helpful?';
    if (helpful === false && !reason) return 'What was off?';
    return 'Thanks!';
  }, [helpful, reason]);

  const saveNote = async () => {
    setSavingNote(true);
    const ok = await onSave(item, { comment: trimmed });
    setSavingNote(false);
    if (ok) setDraft(trimmed);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {!!item.description && <Text style={styles.cardBody}>{item.description}</Text>}
      {!!item.url && /^https?:\/\//i.test(item.url) && (
        <TouchableOpacity style={styles.link} onPress={() => openSafely(item.url)} accessibilityRole="link">
          <Text style={styles.linkText}>Learn more</Text>
          <ExternalLink size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.stars} accessibilityRole="radiogroup" accessibilityLabel="Rate this suggestion">
        {[1, 2, 3, 4, 5].map((n) => {
          const on = (rating ?? 0) >= n;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onSave(item, { rating: rating === n ? null : n })}
              hitSlop={6}
              accessibilityRole="radio"
              accessibilityState={{ checked: rating === n }}
              accessibilityLabel={`Rate ${n} out of 5`}
            >
              <Star size={24} color={on ? Colors.accent : Colors.textTertiary} fill={on ? Colors.accent : 'transparent'} />
            </TouchableOpacity>
          );
        })}
        {!!rating && <Text style={styles.starsLabel}>{rating}/5</Text>}
      </View>

      <View style={styles.thumbs}>
        <Text style={styles.thumbsLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.thumb, helpful === true && styles.thumbOn]}
          onPress={() => onSave(item, { helpful: true })}
          accessibilityRole="button"
          accessibilityState={{ selected: helpful === true }}
          accessibilityLabel="This was helpful"
        >
          <ThumbsUp size={18} color={helpful === true ? Colors.textPrimary : Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.thumb, helpful === false && styles.thumbOn]}
          onPress={() => onSave(item, { helpful: false })}
          accessibilityRole="button"
          accessibilityState={{ selected: helpful === false }}
          accessibilityLabel="This was not helpful"
        >
          <ThumbsDown size={18} color={helpful === false ? Colors.textPrimary : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {helpful === false && (
        <View style={styles.reasons} accessibilityLabel="What was off about this suggestion?">
          {reasons.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.reason, reason === r.key && styles.reasonOn]}
              onPress={() => onSave(item, { reason: reason === r.key ? null : r.key })}
              accessibilityRole="button"
              accessibilityState={{ selected: reason === r.key }}
            >
              <Text style={[styles.reasonText, reason === r.key && styles.reasonTextOn]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {helpful === false && !!reason && (
        <View style={styles.note}>
          <Text style={styles.noteLabel}>
            Anything else Fourby should know? <Text style={styles.noteOptional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.noteInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="e.g. We already use something similar"
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={COMMENT_MAX}
            accessibilityLabel="Note for Fourby"
          />
          <View style={styles.noteRow}>
            <TouchableOpacity
              style={[styles.noteSave, (trimmed === saved || savingNote) && styles.noteSaveDisabled]}
              disabled={trimmed === saved || savingNote}
              onPress={saveNote}
              accessibilityRole="button"
            >
              <Text style={styles.noteSaveText}>{saved !== '' && trimmed === '' ? 'Remove note' : 'Save note'}</Text>
            </TouchableOpacity>
            {saved !== '' && trimmed === saved && <Text style={styles.noteSaved}>Saved ✓</Text>}
          </View>
        </View>
      )}
    </View>
  );
}

function NotLinked({ plan, email, onRefresh }: { plan: FourbyPlan; email: string | null; onRefresh: () => void }) {
  if (plan.reason === 'email_unverified') {
    return (
      <Notice
        title="Verify your email first"
        body="We match your app account to your 4kiddos website account by email. Verify the email on this account, then come back."
        actionLabel="Check again"
        onAction={onRefresh}
      />
    );
  }
  const who = email ? ` using ${email}` : '';
  return (
    <Notice
      title="Get your Fourby plan"
      body={
        plan.reason === 'no_plan'
          ? `Fourby hasn't built a plan for your family yet. Take the quick homeschool quiz on only4kiddos.com${who} and your plan will show up here.`
          : `Fourby plans are made on only4kiddos.com. Take the quick homeschool quiz there${who} and your plan will show up here.`
      }
      actionLabel="Open the quiz"
      onAction={() => openSafely(WEBSITE_PLAN_URL)}
      secondaryLabel="I've done it, check again"
      onSecondary={onRefresh}
    />
  );
}

function Notice({ title, body, actionLabel, onAction, secondaryLabel, onSecondary }: {
  title: string; body: string; actionLabel?: string; onAction?: () => void; secondaryLabel?: string; onSecondary?: () => void;
}) {
  return (
    <View style={styles.notice}>
      <Sparkles size={40} color={Colors.primary} />
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeBody}>{body}</Text>
      {actionLabel && onAction && <BrandedButton title={actionLabel} onPress={onAction} style={styles.noticeButton} />}
      {secondaryLabel && onSecondary && (
        <TouchableOpacity onPress={onSecondary} style={styles.noticeSecondary}>
          <Text style={styles.noticeSecondaryText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing['4xl'] },
  hero: {
    backgroundColor: Colors.brandBackground, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    marginBottom: Spacing.xl, gap: Spacing.sm,
  },
  heroTitle: { fontSize: Typography.fontSizes['2xl'], fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  heroBody: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, lineHeight: 22 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  childBand: {
    alignSelf: 'flex-start', backgroundColor: Colors.primary, color: Colors.textOnPrimary, fontWeight: Typography.fontWeights.bold,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.md, overflow: 'hidden',
    marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.semibold, color: Colors.textPrimary },
  cardBody: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs, lineHeight: 20 },
  link: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm, alignSelf: 'flex-start' },
  linkText: { color: Colors.primary, fontWeight: Typography.fontWeights.semibold },
  stars: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.md },
  starsLabel: { marginLeft: Spacing.sm, color: Colors.textSecondary, fontSize: Typography.fontSizes.sm },
  thumbs: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  thumbsLabel: { color: Colors.textSecondary, fontSize: Typography.fontSizes.sm, marginRight: Spacing.xs },
  thumb: {
    width: 44, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface,
  },
  thumbOn: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  reason: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  reasonOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  reasonText: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary },
  reasonTextOn: { color: Colors.textOnPrimary, fontWeight: Typography.fontWeights.semibold },
  note: { marginTop: Spacing.md },
  noteLabel: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semibold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  noteOptional: { fontWeight: Typography.fontWeights.regular, color: Colors.textTertiary },
  noteInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, minHeight: 64,
    fontSize: Typography.fontSizes.sm, color: Colors.textPrimary, textAlignVertical: 'top',
  },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  noteSave: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  noteSaveDisabled: { opacity: 0.45 },
  noteSaveText: { color: Colors.textOnPrimary, fontWeight: Typography.fontWeights.semibold, fontSize: Typography.fontSizes.sm },
  noteSaved: { color: Colors.success, fontWeight: Typography.fontWeights.semibold, fontSize: Typography.fontSizes.sm },
  notice: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'], backgroundColor: Colors.background, gap: Spacing.md },
  noticeTitle: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, textAlign: 'center' },
  noticeBody: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  noticeButton: { marginTop: Spacing.md, alignSelf: 'stretch' },
  noticeSecondary: { padding: Spacing.sm },
  noticeSecondaryText: { color: Colors.primary, fontWeight: Typography.fontWeights.semibold },
});

import { AlertCircle, Check, ChevronRight, Clock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TrustPalette } from '../../constants/Colors';
import { Task } from '../store/useStore';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  compact?: boolean;
}

const PRIORITY_CONFIG = {
  high: { label: 'Critical', color: TrustPalette.burgundy, bg: '#F4EDEF' },
  medium: { label: 'Scheduled', color: '#8A6A2E', bg: '#F7F1E7' },
  low: { label: 'Routine', color: TrustPalette.emerald, bg: '#EAF5F0' },
};

function getDaysLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, compact }) => {
  const daysLeft = getDaysLeft(task.dueDate);
  const p = PRIORITY_CONFIG[task.priority];

  return (
    <TouchableOpacity
      onPress={() => onToggle(task.id)}
      activeOpacity={0.75}
      style={{ marginBottom: compact ? 10 : 14 }}
    >
      <View
        style={[
          styles.card,
          task.isCompleted && { opacity: 0.5 },
        ]}
      >
        {/* Left accent bar */}
        <View
          style={[
            styles.accent,
            { backgroundColor: task.isCompleted ? '#3f3f46' : p.color },
          ]}
        />

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => onToggle(task.id)}
          activeOpacity={0.6}
          style={[
            styles.checkbox,
            task.isCompleted
              ? { backgroundColor: TrustPalette.emerald, borderColor: TrustPalette.emerald }
              : { borderColor: p.color },
          ]}
        >
          {task.isCompleted && <Check size={12} color="#fff" strokeWidth={3} />}
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              task.isCompleted && styles.titleDone,
              compact && { fontSize: 15 },
            ]}
          >
            {task.title}
          </Text>

          <View style={styles.metaRow}>
            {!task.isCompleted && (
              <View style={[styles.badge, { backgroundColor: p.bg }]}>
                <AlertCircle size={10} color={p.color} />
                <Text style={[styles.badgeText, { color: p.color }]}>
                  {p.label}
                </Text>
              </View>
            )}
            <View style={styles.dateChip}>
              <Clock size={10} color="#8A93A6" />
              <Text style={styles.dateText}>
                {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
              </Text>
            </View>
          </View>
        </View>

        <ChevronRight size={16} color="#3f3f46" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202838',
    borderRadius: 12,
    paddingVertical: 15,
    paddingRight: 16,
    paddingLeft: 0,
    borderWidth: 1,
    borderColor: TrustPalette.borderOnDark,
    overflow: 'hidden',
  },
  accent: {
    width: 5,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  title: {
    color: TrustPalette.offWhite,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  titleDone: {
    color: '#7C879C',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D2D8E3',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#8A93A6',
    fontWeight: '600',
  },
});

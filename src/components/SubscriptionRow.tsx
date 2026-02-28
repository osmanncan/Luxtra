import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TrustPalette } from '../../constants/Colors';
import { SUB_CATEGORIES, Subscription } from '../store/useStore';

interface Props {
  sub: Subscription;
  onPress?: () => void;
}

export const SubscriptionRow: React.FC<Props> = ({ sub, onPress }) => {
  const nextDate = new Date(sub.nextBillingDate);
  const today = new Date();
  const diffDays = Math.ceil(
    (nextDate.getTime() - today.getTime()) / 86400000,
  );
  const isUpcoming = diffDays >= 0 && diffDays <= 3;
  const cat = SUB_CATEGORIES[sub.category] ?? SUB_CATEGORIES.General;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ marginBottom: 12 }}
    >
      <View style={[styles.card, isUpcoming && styles.cardUrgent]}>
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>{cat.emoji}</Text>
        </View>

        {}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{sub.name}</Text>
          <Text style={[styles.meta, isUpcoming && { color: TrustPalette.emerald }]}> 
            {isUpcoming
              ? diffDays === 0
                ? '⚡ Due today!'
                : `⚡ Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
              : `${sub.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} · ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </Text>
        </View>

        {}
        <View style={styles.amountWrap}>
          <Text style={styles.amount}>
            {sub.currency === 'USD' ? '$' : '₺'}
            {sub.amount.toFixed(2)}
          </Text>
          <Text style={styles.amountCycle}>
            /{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
          </Text>
        </View>

        <ChevronRight size={16} color="#8A93A6" style={{ marginLeft: 4 }} />
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
    padding: 14,
    borderWidth: 1,
    borderColor: TrustPalette.borderOnDark,
  },
  cardUrgent: {
    borderColor: '#2A7A58',
    backgroundColor: '#213747',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#1A1F2C',
    borderWidth: 1,
    borderColor: TrustPalette.borderOnDark,
  },
  emoji: {
    fontSize: 20,
  },
  name: {
    color: TrustPalette.offWhite,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  meta: {
    color: '#8A93A6',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amount: {
    color: TrustPalette.offWhite,
    fontSize: 17,
    fontWeight: '700',
  },
  amountCycle: {
    color: '#8A93A6',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});


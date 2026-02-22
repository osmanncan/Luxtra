import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface PaymentWidgetProps {
  totalAmount: string;
  nextPaymentName: string;
  nextPaymentDays: string;
}

export function PaymentWidget({ totalAmount, nextPaymentName, nextPaymentDays }: PaymentWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#18181b', // zinc-900 (dark theme bg)
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
      clickActionData={{ uri: 'lifeos://spending' }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="LifeOS"
          style={{
            fontSize: 12,
            fontFamily: 'SpaceMono',
            color: '#a1a1aa', // zinc-400
          }}
        />
        <FlexWidget
            style={{
                height: 8,
                width: 8,
                borderRadius: 4,
                backgroundColor: '#10b981', // emerald-500
            }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
            flexDirection: 'column',
        }}
      >
        <TextWidget
            text="Upcoming"
            style={{
                fontSize: 10,
                color: '#71717a', // zinc-500
                marginBottom: 2,
            }}
        />
        <TextWidget
            text={nextPaymentName || 'No payments'}
            style={{
                fontSize: 16,
                fontFamily: 'SpaceMono',
                fontWeight: 'bold',
                color: '#f4f4f5', // zinc-100
                marginBottom: 2,
            }}
        />
        <TextWidget
            text={nextPaymentDays ? `${nextPaymentDays} days left` : ''}
            style={{
                fontSize: 12,
                color: '#10b981', // emerald-500
            }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
            height: 1,
            width: 'match_parent',
            backgroundColor: '#27272a', // zinc-800
            marginVertical: 8,
        }}
      />

      <FlexWidget
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}
      >
        <TextWidget
            text="Total Monthly"
            style={{
                fontSize: 10,
                color: '#71717a', // zinc-500
            }}
        />
        <TextWidget
            text={totalAmount}
            style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#f4f4f5', // zinc-100
            }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

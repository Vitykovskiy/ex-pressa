import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';

const STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.Created]: OrderStatus.Confirmed,
  [OrderStatus.Confirmed]: OrderStatus.Ready,
  [OrderStatus.Ready]: OrderStatus.Closed,
};

type MutableOrderWorkflowState = Pick<
  Order,
  'status' | 'confirmedAt' | 'readyAt' | 'closedAt' | 'rejectReason'
>;

@Injectable()
export class OrderWorkflowService {
  getExpectedNextStatus(current: OrderStatus): OrderStatus | undefined {
    return STATUS_TRANSITIONS[current];
  }

  canReject(current: OrderStatus): boolean {
    return current === OrderStatus.Created || current === OrderStatus.Confirmed;
  }

  shouldReleaseSlotAfterStatus(nextStatus: OrderStatus): boolean {
    return nextStatus === OrderStatus.Closed;
  }

  shouldNotifyReady(nextStatus: OrderStatus): boolean {
    return nextStatus === OrderStatus.Ready;
  }

  applyStatusTransition(
    order: MutableOrderWorkflowState,
    nextStatus: OrderStatus,
    now = new Date(),
  ): void {
    order.status = nextStatus;

    if (nextStatus === OrderStatus.Confirmed) {
      order.confirmedAt = now;
      return;
    }
    if (nextStatus === OrderStatus.Ready) {
      order.readyAt = now;
      return;
    }
    if (nextStatus === OrderStatus.Closed) {
      order.closedAt = now;
    }
  }

  applyRejection(order: MutableOrderWorkflowState, reason: string): void {
    order.status = OrderStatus.Rejected;
    order.rejectReason = reason;
  }
}

import { OrderStatus } from './order-status.enum';
import { OrderWorkflowService } from './order-workflow.service';

describe('OrderWorkflowService', () => {
  const service = new OrderWorkflowService();

  it('returns expected status transition chain', () => {
    expect(service.getExpectedNextStatus(OrderStatus.Created)).toBe(
      OrderStatus.Confirmed,
    );
    expect(service.getExpectedNextStatus(OrderStatus.Confirmed)).toBe(
      OrderStatus.Ready,
    );
    expect(service.getExpectedNextStatus(OrderStatus.Ready)).toBe(
      OrderStatus.Closed,
    );
    expect(service.getExpectedNextStatus(OrderStatus.Closed)).toBeUndefined();
  });

  it('allows reject only from created and confirmed statuses', () => {
    expect(service.canReject(OrderStatus.Created)).toBe(true);
    expect(service.canReject(OrderStatus.Confirmed)).toBe(true);
    expect(service.canReject(OrderStatus.Ready)).toBe(false);
    expect(service.canReject(OrderStatus.Closed)).toBe(false);
    expect(service.canReject(OrderStatus.Rejected)).toBe(false);
  });

  it('applies transition timestamps and status', () => {
    const now = new Date('2026-01-01T10:00:00.000Z');
    const order = {
      status: OrderStatus.Created,
      confirmedAt: null,
      readyAt: null,
      closedAt: null,
      rejectReason: null,
    };

    service.applyStatusTransition(order, OrderStatus.Confirmed, now);
    expect(order.status).toBe(OrderStatus.Confirmed);
    expect(order.confirmedAt).toEqual(now);

    service.applyStatusTransition(order, OrderStatus.Ready, now);
    expect(order.status).toBe(OrderStatus.Ready);
    expect(order.readyAt).toEqual(now);

    service.applyStatusTransition(order, OrderStatus.Closed, now);
    expect(order.status).toBe(OrderStatus.Closed);
    expect(order.closedAt).toEqual(now);
  });

  it('applies rejection payload', () => {
    const order = {
      status: OrderStatus.Confirmed,
      confirmedAt: null,
      readyAt: null,
      closedAt: null,
      rejectReason: null,
    };

    service.applyRejection(order, 'Customer cancelled');

    expect(order.status).toBe(OrderStatus.Rejected);
    expect(order.rejectReason).toBe('Customer cancelled');
  });
});

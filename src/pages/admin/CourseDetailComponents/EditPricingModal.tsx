import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Typography } from 'antd';
import dayjs from 'dayjs';
import type { PricingData } from './PricingTimeline';

const { Text } = Typography;

export type EditMode = 'price' | 'teacherWage' | 'taWage' | 'dates';

interface EditPricingModalProps {
  open: boolean;
  mode: EditMode | null;
  record: PricingData | null;
  hasExistingRecords?: boolean;
  submitting: boolean;
  lastStudentBillDate: string | null;
  lastTeacherWageDate: string | null;
  lastAssistantWageDate: string | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const EditPricingModal: React.FC<EditPricingModalProps> = ({
  open,
  mode,
  record,
  hasExistingRecords = false,
  submitting,
  lastStudentBillDate,
  lastTeacherWageDate,
  lastAssistantWageDate,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && mode) {
      if (record) {
        const fromVal = record.effectiveFrom ? dayjs(record.effectiveFrom) : undefined;
        const toVal = record.effectiveTo ? dayjs(record.effectiveTo) : undefined;

        if (mode === 'price') {
          form.setFieldsValue({
            pricePerSession: Number(record.pricePerSession),
            effectiveFrom: fromVal,
            effectiveTo: toVal,
          });
        } else if (mode === 'teacherWage') {
          form.setFieldsValue({
            teacherWagePerSession: Number(record.teacherWagePerSession),
            effectiveFrom: fromVal,
            effectiveTo: toVal,
          });
        } else if (mode === 'taWage') {
          form.setFieldsValue({
            taWagePerSession: Number(record.taWagePerSession || 0),
            effectiveFrom: fromVal,
            effectiveTo: toVal,
          });
        }
      } else {
        form.setFieldsValue({
          pricePerSession: undefined,
          teacherWagePerSession: undefined,
          taWagePerSession: undefined,
          effectiveFrom: dayjs(),
          effectiveTo: undefined,
        });
      }
    }
  }, [open, mode, record, form]);

  const getTitle = () => {
    const isCreate = !record;
    if (mode === 'price') return isCreate ? 'Thêm đơn giá học viên / buổi' : 'Sửa đơn giá học viên / buổi';
    if (mode === 'teacherWage') return isCreate ? 'Thêm lương giáo viên / buổi' : 'Sửa lương giáo viên / buổi';
    if (mode === 'taWage') return isCreate ? 'Thêm lương trợ giảng / buổi' : 'Sửa lương trợ giảng / buổi';
    return '';
  };

  const todayStr = dayjs().format('YYYY-MM-DD');
  const isFromLocked = Boolean(record && record.effectiveFrom <= todayStr);
  const isToLocked = Boolean(record && record.effectiveTo && record.effectiveTo <= todayStr);

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText={record ? 'Lưu thay đổi' : 'Thêm mới'}
      cancelText="Hủy"
      destroyOnClose
      width={450}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 16 }}>
        {!record && !hasExistingRecords && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 6 }}>
            <Text style={{ fontSize: '12px', color: '#2563eb' }}>
              💡 <strong>Chưa có cấu hình giá cho mục này:</strong> Bạn có thể chọn ngày bắt đầu từ quá khứ (ví dụ ngày bắt đầu khóa học) để tính toán cho các buổi học trước đó.
            </Text>
          </div>
        )}
        {mode === 'price' && (
          <>
            {lastStudentBillDate ? (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 6 }}>
                <Text style={{ fontSize: '12px', color: '#10b981' }}>
                  💡 <strong>Học viên chốt lần cuối:</strong> {dayjs(lastStudentBillDate).format('DD/MM/YYYY')}
                </Text>
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(16, 185, 129, 0.04)', border: '1px dotted rgba(16, 185, 129, 0.2)', borderRadius: 6 }}>
                <Text style={{ fontSize: '12px', color: '#10b981' }}>
                  💡 Chưa có dữ liệu chốt học phí cho học viên.
                </Text>
              </div>
            )}
            <Form.Item
              name="pricePerSession"
              label="Đơn giá học viên / buổi"
              rules={[{ required: true, message: 'Nhập đơn giá học sinh!' }]}
            >
              <InputNumber
                disabled={record?.isStudentPriceLocked && isFromLocked}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="VND"
                min={0}
                autoFocus
              />
            </Form.Item>
          </>
        )}

        {mode === 'teacherWage' && (
          <>
            {lastTeacherWageDate ? (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: 6 }}>
                <Text style={{ fontSize: '12px', color: '#d97706' }}>
                  💡 <strong>Giáo viên chốt lương lần cuối:</strong> {dayjs(lastTeacherWageDate).format('DD/MM/YYYY')}
                </Text>
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(251, 191, 36, 0.04)', border: '1px dotted rgba(251, 191, 36, 0.2)', borderRadius: 6 }}>
                <Text style={{ fontSize: '12px', color: '#d97706' }}>
                  💡 Chưa có dữ liệu chốt lương cho giáo viên.
                </Text>
              </div>
            )}
            <Form.Item
              name="teacherWagePerSession"
              label="Lương giáo viên / buổi"
              rules={[{ required: true, message: 'Nhập lương giáo viên!' }]}
            >
              <InputNumber
                disabled={record?.isTeacherWageLocked && isFromLocked}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="VND"
                min={0}
                autoFocus
              />
            </Form.Item>
          </>
        )}

        {mode === 'taWage' && (
          <>
            {lastAssistantWageDate ? (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: 6 }}>
                <Text style={{ fontSize: '12px', color: '#2563eb' }}>
                  💡 <strong>Trợ giảng chốt lương lần cuối:</strong> {dayjs(lastAssistantWageDate).format('DD/MM/YYYY')}
                </Text>
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(96, 165, 250, 0.04)', border: '1px dotted rgba(96, 165, 250, 0.2)', borderRadius: 6 }}>
                <Text style={{ fontSize: '12px', color: '#2563eb' }}>
                  💡 Chưa có dữ liệu chốt lương cho trợ giảng.
                </Text>
              </div>
            )}
            <Form.Item
              name="taWagePerSession"
              label="Lương trợ giảng / buổi"
              rules={[{ required: true, message: 'Nhập lương trợ giảng!' }]}
            >
              <InputNumber
                disabled={record?.isTaWageLocked && isFromLocked}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="VND"
                min={0}
                autoFocus
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="effectiveFrom"
          label="Ngày bắt đầu áp dụng"
          rules={[
            { required: true, message: 'Vui lòng chọn ngày!' },
            () => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                const dateStr = value.format('YYYY-MM-DD');

                // Nếu là bản ghi đang sửa và ngày bắt đầu không thay đổi: Luôn hợp lệ (giữ nguyên ngày đầu tiên)
                if (record && dateStr === record.effectiveFrom) {
                  return Promise.resolve();
                }

                // Nếu là sửa bản ghi, hoặc tạo mới khi ĐÃ CÓ bản ghi trước đó: Ngày bắt đầu phải lớn hơn hôm nay
                if ((record || hasExistingRecords) && dateStr <= todayStr) {
                  return Promise.reject(
                    new Error(`Ngày bắt đầu áp dụng mới phải lớn hơn ngày hôm nay (${dayjs(todayStr).format('DD/MM/YYYY')}).`)
                  );
                }

                let limitDateStr: string | null = null;
                let typeText = '';

                if (mode === 'price') {
                  limitDateStr = lastStudentBillDate;
                  typeText = 'chốt học phí học viên';
                } else if (mode === 'teacherWage') {
                  limitDateStr = lastTeacherWageDate;
                  typeText = 'chốt lương giáo viên';
                } else if (mode === 'taWage') {
                  limitDateStr = lastAssistantWageDate;
                  typeText = 'chốt lương trợ giảng';
                }

                if (limitDateStr && dateStr <= limitDateStr) {
                  return Promise.reject(
                    new Error(`Ngày bắt đầu áp dụng phải sau ngày ${dayjs(limitDateStr).format('DD/MM/YYYY')} (ngày ${typeText} gần nhất).`)
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            disabled={isFromLocked}
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={(current) => {
              if (!current) return false;
              // Nếu đang sửa bản ghi, hoặc tạo mới khi ĐÃ CÓ bản ghi trước đó: Không cho chọn ngày trong quá khứ
              if ((record || hasExistingRecords) && current <= dayjs().endOf('day')) {
                return true;
              }
              let limitDateStr: string | null = null;
              if (mode === 'price') limitDateStr = lastStudentBillDate;
              else if (mode === 'teacherWage') limitDateStr = lastTeacherWageDate;
              else if (mode === 'taWage') limitDateStr = lastAssistantWageDate;
              if (!limitDateStr) return false;
              return current <= dayjs(limitDateStr).endOf('day');
            }}
          />
        </Form.Item>

        <Form.Item
          name="effectiveTo"
          label="Ngày kết thúc"
          rules={[
            { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                const fromVal = getFieldValue('effectiveFrom');
                if (fromVal && value.isBefore(fromVal, 'day')) {
                  return Promise.reject(
                    new Error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.')
                  );
                }
                const dateStr = value.format('YYYY-MM-DD');

                // Nếu là bản ghi đang sửa và ngày kết thúc không thay đổi: Luôn hợp lệ
                if (record && record.effectiveTo && dateStr === record.effectiveTo) {
                  return Promise.resolve();
                }

                if (dateStr < todayStr) {
                  return Promise.reject(
                    new Error(`Ngày kết thúc không được ở trong quá khứ (phải từ ngày hôm nay ${dayjs(todayStr).format('DD/MM/YYYY')} trở đi).`)
                  );
                }

                let limitDateStr: string | null = null;
                let typeText = '';

                if (mode === 'price') {
                  limitDateStr = lastStudentBillDate;
                  typeText = 'chốt học phí học viên';
                } else if (mode === 'teacherWage') {
                  limitDateStr = lastTeacherWageDate;
                  typeText = 'chốt lương giáo viên';
                } else if (mode === 'taWage') {
                  limitDateStr = lastAssistantWageDate;
                  typeText = 'chốt lương trợ giảng';
                }

                if (limitDateStr && dateStr <= limitDateStr) {
                  return Promise.reject(
                    new Error(`Ngày kết thúc áp dụng phải sau ngày ${dayjs(limitDateStr).format('DD/MM/YYYY')} (ngày ${typeText} gần nhất).`)
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            disabled={isToLocked}
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày kết thúc"
            disabledDate={(current) => {
              if (!current) return false;
              if (current < dayjs().startOf('day')) {
                return true;
              }
              const fromVal = form.getFieldValue('effectiveFrom');
              if (fromVal && current < fromVal.startOf('day')) {
                return true;
              }
              let limitDateStr: string | null = null;
              if (mode === 'price') limitDateStr = lastStudentBillDate;
              else if (mode === 'teacherWage') limitDateStr = lastTeacherWageDate;
              else if (mode === 'taWage') limitDateStr = lastAssistantWageDate;

              if (limitDateStr && current <= dayjs(limitDateStr).endOf('day')) {
                return true;
              }
              return false;
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

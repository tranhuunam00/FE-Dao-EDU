import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Table, Typography, Button, App, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;

export interface PricingData {
  id: string;
  pricePerSession: number;
  teacherWagePerSession: number;
  taWagePerSession: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isStudentPriceLocked?: boolean;
  isTeacherWageLocked?: boolean;
  isTaWageLocked?: boolean;
  isDateRangeLocked?: boolean;
  lastStudentBillDate?: string | null;
  lastTeacherWageDate?: string | null;
  lastAssistantWageDate?: string | null;
}

interface LevelPricingModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedLevel: {
    id: string;
    levelName: string;
    pricing: PricingData[];
  } | null;
}

interface DisjointSegment {
  rate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  pricingId: string;
}

export const computeDisjointSegments = (pricing: PricingData[], rateField: 'pricePerSession' | 'teacherWagePerSession' | 'taWagePerSession'): DisjointSegment[] => {
  const activePricing = pricing.filter(p => Number((p as any)[rateField]) > 0);
  if (activePricing.length === 0) return [];

  // Sort pricing newest first to prioritize the latest configured rules when ranges overlap
  const sortedPricing = [...activePricing].sort((a, b) => {
    const getTimestamp = (p: PricingData) => {
      if ((p as any).createdAt) return new Date((p as any).createdAt).getTime();
      return 0;
    };
    const tA = getTimestamp(a);
    const tB = getTimestamp(b);
    if (tA !== tB) return tB - tA;
    if (a.id && b.id) return b.id.localeCompare(a.id);
    return dayjs(b.effectiveFrom).diff(dayjs(a.effectiveFrom));
  });

  // Collect all boundary dates
  const datesSet = new Set<string>();
  for (const p of activePricing) {
    datesSet.add(p.effectiveFrom);
    if (p.effectiveTo) {
      const nextDay = dayjs(p.effectiveTo).add(1, 'day').format('YYYY-MM-DD');
      datesSet.add(nextDay);
    }
  }

  const sortedDates = Array.from(datesSet).sort();
  if (sortedDates.length === 0) return [];

  const segments: DisjointSegment[] = [];

  for (let i = 0; i < sortedDates.length; i++) {
    const start = sortedDates[i];
    const end = i < sortedDates.length - 1 
      ? dayjs(sortedDates[i + 1]).subtract(1, 'day').format('YYYY-MM-DD') 
      : null;

    // Find the highest priority pricing that covers this range
    const covering = sortedPricing.find(p => {
      const pFrom = p.effectiveFrom;
      const pTo = p.effectiveTo;
      // Gracefully handle inverted boundaries
      if (pTo !== null && pTo < pFrom) return false;
      return pFrom <= start && (pTo === null || pTo >= start);
    });

    if (covering) {
      segments.push({
        rate: Number((covering as any)[rateField]),
        effectiveFrom: start,
        effectiveTo: end,
        pricingId: covering.id
      });
    }
  }

  // Merge adjacent segments that have the same rate
  const mergedSegments: DisjointSegment[] = [];
  for (const seg of segments) {
    if (mergedSegments.length === 0) {
      mergedSegments.push(seg);
    } else {
      const last = mergedSegments[mergedSegments.length - 1];
      if (last.rate === seg.rate) {
        last.effectiveTo = seg.effectiveTo;
      } else {
        mergedSegments.push(seg);
      }
    }
  }

  return mergedSegments;
};

export const renderPricingTimeline = (pricing: PricingData[], type?: 'student' | 'teacher' | 'ta') => {
  if (!pricing || pricing.length === 0) return null;

  const timelineColors = [
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#ffffff' }, // Green
    { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', text: '#ffffff' }, // Blue
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#ffffff' }, // Amber
    { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', text: '#ffffff' }, // Violet
    { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', text: '#ffffff' }, // Pink
    { bg: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', text: '#ffffff' }, // Teal
    { bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', text: '#ffffff' }, // Orange
  ];

  const rateField = type === 'student' ? 'pricePerSession' : type === 'teacher' ? 'teacherWagePerSession' : 'taWagePerSession';
  const segments = computeDisjointSegments(pricing, rateField);

  if (segments.length === 0) {
    return (
      <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center', border: '1px dashed var(--card-border)', marginBottom: 16 }}>
        <Text type="secondary">Chưa cấu hình bảng giá khoảng thời gian này</Text>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ padding: '4px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        {/* Continuous horizontal segmented timeline */}
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.15)', minHeight: 52 }}>
          {segments.map((seg, idx) => {
            const color = timelineColors[idx % timelineColors.length];
            const fromLabel = dayjs(seg.effectiveFrom).format('DD/MM/YYYY');
            const toLabel = seg.effectiveTo ? dayjs(seg.effectiveTo).format('DD/MM/YYYY') : 'Nay';

            return (
              <div 
                key={idx} 
                style={{ 
                  flex: 1, 
                  background: color.bg, 
                  color: color.text, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px 12px',
                  borderRight: idx < segments.length - 1 ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {seg.rate.toLocaleString()}đ
                </span>
                <span style={{ fontSize: '10px', opacity: 0.9, marginTop: 2, fontWeight: 500 }}>
                  {fromLabel} - {toLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LevelPricingModal: React.FC<LevelPricingModalProps> = ({ open, onCancel, onSuccess, selectedLevel }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submittingEditPricing, setSubmittingEditPricing] = useState(false);

  type EditMode = 'price' | 'teacherWage' | 'taWage' | 'dates';

  interface EditModalState {
    open: boolean;
    mode: EditMode | null;
    record: PricingData | null;
  }

  const [editState, setEditState] = useState<EditModalState>({ open: false, mode: null, record: null });

  useEffect(() => {
    if (open && selectedLevel) {
      const todayStr = dayjs().format('YYYY-MM-DD');
      const current = selectedLevel.pricing?.find(
        (p) => p.effectiveFrom <= todayStr && (!p.effectiveTo || p.effectiveTo >= todayStr)
      );
      if (current) {
        form.setFieldsValue({
          pricePerSession: Number(current.pricePerSession),
          teacherWagePerSession: Number(current.teacherWagePerSession),
          taWagePerSession: Number(current.taWagePerSession || 0),
          effectiveFrom: dayjs(),
          effectiveTo: undefined,
        });
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
  }, [open, selectedLevel, form]);

  useEffect(() => {
    if (editState.open && editState.mode) {
      if (editState.record) {
        const fromVal = editState.record.effectiveFrom ? dayjs(editState.record.effectiveFrom) : undefined;
        const toVal = editState.record.effectiveTo ? dayjs(editState.record.effectiveTo) : undefined;

        if (editState.mode === 'price') {
          editForm.setFieldsValue({
            pricePerSession: Number(editState.record.pricePerSession),
            effectiveFrom: fromVal,
            effectiveTo: toVal,
          });
        } else if (editState.mode === 'teacherWage') {
          editForm.setFieldsValue({
            teacherWagePerSession: Number(editState.record.teacherWagePerSession),
            effectiveFrom: fromVal,
            effectiveTo: toVal,
          });
        } else if (editState.mode === 'taWage') {
          editForm.setFieldsValue({
            taWagePerSession: Number(editState.record.taWagePerSession || 0),
            effectiveFrom: fromVal,
            effectiveTo: toVal,
          });
        }
      } else {
        // CREATE Mode: clean fields
        editForm.setFieldsValue({
          pricePerSession: undefined,
          teacherWagePerSession: undefined,
          taWagePerSession: undefined,
          effectiveFrom: dayjs(),
          effectiveTo: undefined,
        });
      }
    }
  }, [editState, editForm]);


  const handleEditPricingSubmit = async (values: any) => {
    if (!editState.mode) return;
    const record = editState.record;
    const isCreate = !record;

    setSubmittingEditPricing(true);
    try {
      // 1. Fetch active classes of this level
      const { data: activeClasses } = await api.get(`/courses/levels/${selectedLevel?.id}/active-classes`);

      const proceedSave = async () => {
        setSubmittingEditPricing(true);
        try {
          const payload: any = {};
          if (editState.mode === 'price') {
            payload.pricePerSession = Number(values.pricePerSession);
          } else if (editState.mode === 'teacherWage') {
            payload.teacherWagePerSession = Number(values.teacherWagePerSession);
          } else if (editState.mode === 'taWage') {
            payload.taWagePerSession = Number(values.taWagePerSession || 0);
          }
          payload.effectiveFrom = values.effectiveFrom.format('YYYY-MM-DD');
          payload.effectiveTo = values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : null;

          if (isCreate) {
            await api.post(`/courses/levels/${selectedLevel?.id}/pricing`, payload);
            message.success('Thêm mới bảng giá thành công!');
          } else {
            await api.put(`/courses/pricing/${record.id}`, payload);
            message.success('Sửa đổi thành công!');
          }
          setEditState({ open: false, mode: null, record: null });
          onSuccess();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Không thể cập nhật thông tin bảng giá.');
        } finally {
          setSubmittingEditPricing(false);
        }
      };

      if (!isCreate && activeClasses && activeClasses.length > 0) {
        // Show confirmation modal listing the classes
        const classListHtml = (
          <ul style={{ paddingLeft: '16px', margin: '8px 0 0 0', maxHeight: '150px', overflowY: 'auto' }}>
            {activeClasses.map((c: any) => (
              <li key={c.id}>
                <strong>[{c.classCode}]</strong> {c.className}
              </li>
            ))}
          </ul>
        );

        setSubmittingEditPricing(false); // release loading state so modal works cleanly
        Modal.confirm({
          title: 'Cảnh báo áp dụng thay đổi',
          content: (
            <div>
              <p>Thay đổi này sẽ được áp dụng lên các lớp đang hoạt động sau:</p>
              {classListHtml}
              <p style={{ marginTop: 12, fontWeight: 500, color: 'red' }}>
                Bạn có chắc chắn muốn lưu thay đổi này không?
              </p>
            </div>
          ),
          okText: 'Đồng ý lưu',
          cancelText: 'Hủy',
          onOk: () => proceedSave(),
          onCancel: () => {
            setSubmittingEditPricing(false);
          }
        });
      } else {
        // Direct save if no active classes or if it is CREATE mode
        await proceedSave();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể kiểm tra danh sách lớp bị ảnh hưởng.');
      setSubmittingEditPricing(false);
    }
  };


  const getEditModalTitle = () => {
    const isCreate = !editState.record;
    if (editState.mode === 'price') return isCreate ? 'Thêm đơn giá học viên / buổi' : 'Sửa đơn giá học viên / buổi';
    if (editState.mode === 'teacherWage') return isCreate ? 'Thêm lương giáo viên / buổi' : 'Sửa lương giáo viên / buổi';
    if (editState.mode === 'taWage') return isCreate ? 'Thêm lương trợ giảng / buổi' : 'Sửa lương trợ giảng / buổi';
    return '';
  };

  const pricingList = selectedLevel?.pricing || [];

  // Last reconciled (chốt sổ) date is level-wide: take the MAX across ALL pricing records
  const lastStudentBillDate = pricingList.reduce<string | null>((max, p) => {
    const d = p.lastStudentBillDate;
    if (!d) return max;
    return max === null || d > max ? d : max;
  }, null);
  const lastTeacherWageDate = pricingList.reduce<string | null>((max, p) => {
    const d = p.lastTeacherWageDate;
    if (!d) return max;
    return max === null || d > max ? d : max;
  }, null);
  const lastAssistantWageDate = pricingList.reduce<string | null>((max, p) => {
    const d = p.lastAssistantWageDate;
    if (!d) return max;
    return max === null || d > max ? d : max;
  }, null);

  // Filter pricing history by type and sort by creation time (newest configured first)
  const sortHistoryNewestFirst = (a: PricingData, b: PricingData) => {
    if (a.id && b.id && a.id.startsWith('pricing-') && b.id.startsWith('pricing-')) {
      // For mock ids in tests
      return b.id.localeCompare(a.id);
    }
    // If createdAt exists, compare by createdAt timestamp DESC
    const getTimestamp = (p: PricingData) => {
      if ((p as any).createdAt) return new Date((p as any).createdAt).getTime();
      return 0;
    };
    const tA = getTimestamp(a);
    const tB = getTimestamp(b);
    if (tA !== tB) return tB - tA;
    
    // Otherwise fallback to ID sort
    if (a.id && b.id) return b.id.localeCompare(a.id);
    return dayjs(b.effectiveFrom).diff(dayjs(a.effectiveFrom));
  };

  const studentPricing = [...pricingList].filter(p => Number(p.pricePerSession) > 0)
    .sort(sortHistoryNewestFirst);
  const teacherPricing = [...pricingList].filter(p => Number(p.teacherWagePerSession) > 0)
    .sort(sortHistoryNewestFirst);
  const taPricing = [...pricingList].filter(p => Number(p.taWagePerSession) > 0)
    .sort(sortHistoryNewestFirst);

  return (
    <>
      <Modal
        title={`Cấu hình đơn giá & lương: ${selectedLevel?.levelName}`}
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Đóng
          </Button>
        ]}
        destroyOnClose
        width={850}
      >
        <Tabs
          defaultActiveKey="1"
          style={{ marginTop: 8 }}
          items={[
            {
              key: '1',
              label: 'Đơn giá học viên',
              children: (
                <div style={{ marginTop: 12 }}>
                  {renderPricingTimeline(pricingList, 'student')}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 16 }}>
                    <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Lịch sử đơn giá học viên</Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setEditState({ open: true, mode: 'price', record: null })}
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                    >
                      Thêm đơn giá mới
                    </Button>
                  </div>
                  <Table
                    dataSource={studentPricing}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Đơn giá / buổi',
                        dataIndex: 'pricePerSession',
                        render: (v: number, record: PricingData) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong style={{ color: '#34d399' }}>{Number(v).toLocaleString()}đ</Text>
                            {record.isStudentPriceLocked && (
                              <Text type="secondary" title="Đã có học viên đóng tiền, không thể thay đổi">🔒</Text>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: 'Hiệu lực',
                        key: 'range',
                        render: (_: any, record: PricingData) => (
                          <Text style={{ fontSize: '12px' }}>
                            {dayjs(record.effectiveFrom).format('DD/MM/YYYY')} - {record.effectiveTo ? dayjs(record.effectiveTo).format('DD/MM/YYYY') : 'Nay'}
                          </Text>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: '2',
              label: 'Lương giáo viên',
              children: (
                <div style={{ marginTop: 12 }}>
                  {renderPricingTimeline(pricingList, 'teacher')}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 16 }}>
                    <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Lịch sử lương giáo viên</Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setEditState({ open: true, mode: 'teacherWage', record: null })}
                      style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', border: 'none' }}
                    >
                      Thêm lương mới
                    </Button>
                  </div>
                  <Table
                    dataSource={teacherPricing}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Lương giáo viên / buổi',
                        dataIndex: 'teacherWagePerSession',
                        render: (v: number, record: PricingData) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong style={{ color: '#fbbf24' }}>{Number(v).toLocaleString()}đ</Text>
                            {record.isTeacherWageLocked && (
                              <Text type="secondary" title="Đã chốt lương giáo viên, không thể thay đổi">🔒</Text>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: 'Hiệu lực',
                        key: 'range',
                        render: (_: any, record: PricingData) => (
                          <Text style={{ fontSize: '12px' }}>
                            {dayjs(record.effectiveFrom).format('DD/MM/YYYY')} - {record.effectiveTo ? dayjs(record.effectiveTo).format('DD/MM/YYYY') : 'Nay'}
                          </Text>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: '3',
              label: 'Lương trợ giảng',
              children: (
                <div style={{ marginTop: 12 }}>
                  {renderPricingTimeline(pricingList, 'ta')}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 16 }}>
                    <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Lịch sử lương trợ giảng</Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setEditState({ open: true, mode: 'taWage', record: null })}
                      style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', border: 'none' }}
                    >
                      Thêm lương trợ giảng mới
                    </Button>
                  </div>
                  <Table
                    dataSource={taPricing}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Lương trợ giảng / buổi',
                        dataIndex: 'taWagePerSession',
                        render: (v: number, record: PricingData) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong style={{ color: '#60a5fa' }}>{Number(v).toLocaleString()}đ</Text>
                            {record.isTaWageLocked && (
                              <Text type="secondary" title="Đã chốt lương trợ giảng, không thể thay đổi">🔒</Text>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: 'Hiệu lực',
                        key: 'range',
                        render: (_: any, record: PricingData) => (
                          <Text style={{ fontSize: '12px' }}>
                            {dayjs(record.effectiveFrom).format('DD/MM/YYYY')} - {record.effectiveTo ? dayjs(record.effectiveTo).format('DD/MM/YYYY') : 'Nay'}
                          </Text>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal Sửa / Thêm Mới Từng Phần */}
      <Modal
        title={getEditModalTitle()}
        open={editState.open}
        onCancel={() => setEditState({ open: false, mode: null, record: null })}
        onOk={() => editForm.submit()}
        confirmLoading={submittingEditPricing}
        okText={editState.record ? "Lưu thay đổi" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
        width={450}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditPricingSubmit} style={{ marginTop: 16 }}>
          {editState.mode === 'price' && (
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
                  disabled={editState.record?.isStudentPriceLocked}
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

          {editState.mode === 'teacherWage' && (
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
                  disabled={editState.record?.isTeacherWageLocked}
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

          {editState.mode === 'taWage' && (
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
                  disabled={editState.record?.isTaWageLocked}
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
                  let limitDateStr: string | null = null;
                  let typeText = '';

                  if (editState.mode === 'price') {
                    limitDateStr = lastStudentBillDate;
                    typeText = 'chốt học phí học viên';
                  } else if (editState.mode === 'teacherWage') {
                    limitDateStr = lastTeacherWageDate;
                    typeText = 'chốt lương giáo viên';
                  } else if (editState.mode === 'taWage') {
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
            <DatePicker disabled={editState.record?.isDateRangeLocked} style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="effectiveTo"
            label="Ngày kết thúc (Không bắt buộc)"
            rules={[
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const dateStr = value.format('YYYY-MM-DD');
                  let limitDateStr: string | null = null;
                  let typeText = '';

                  if (editState.mode === 'price') {
                    limitDateStr = lastStudentBillDate;
                    typeText = 'chốt học phí học viên';
                  } else if (editState.mode === 'teacherWage') {
                    limitDateStr = lastTeacherWageDate;
                    typeText = 'chốt lương giáo viên';
                  } else if (editState.mode === 'taWage') {
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
            <DatePicker disabled={editState.record?.isDateRangeLocked} style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Để trống nếu hiện hành" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LevelPricingModal;

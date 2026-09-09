import React, { useState } from 'react';
import { Modal, Typography, Button, App, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { sortPricingNewestFirst } from '../../../utils/pricing';
import {
  renderPricingTimeline,
  computeDisjointSegments,
  type PricingData,
  type DisjointSegment,
} from './PricingTimeline';
import { EditPricingModal, type EditMode } from './EditPricingModal';
import { PricingHistoryTable } from './PricingHistoryTable';

export {
  renderPricingTimeline,
  computeDisjointSegments,
  type PricingData,
  type DisjointSegment,
};

const { Text } = Typography;

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

interface EditModalState {
  open: boolean;
  mode: EditMode | null;
  record: PricingData | null;
}

const LevelPricingModal: React.FC<LevelPricingModalProps> = ({
  open,
  onCancel,
  onSuccess,
  selectedLevel,
}) => {
  const { message } = App.useApp();
  const [submittingEditPricing, setSubmittingEditPricing] = useState(false);
  const [editState, setEditState] = useState<EditModalState>({
    open: false,
    mode: null,
    record: null,
  });

  const handleDeletePricing = async (pricingId: string) => {
    try {
      await api.delete(`/courses/pricing/${pricingId}`);
      message.success('Xóa bản ghi đơn giá thành công!');
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa bản ghi đơn giá.');
    }
  };

  const handleEditPricingSubmit = async (values: any) => {
    if (!editState.mode) return;
    const record = editState.record;
    const isCreate = !record;

    setSubmittingEditPricing(true);
    try {
      const { data: activeClasses } = await api.get(
        `/courses/levels/${selectedLevel?.id}/active-classes`,
      );

      const proceedSave = async () => {
        setSubmittingEditPricing(true);
        try {
          const payload: any = {};
          if (editState.mode === 'price') {
            payload.pricePerSession = Number(values.pricePerSession);
            payload.type = 'student';
          } else if (editState.mode === 'teacherWage') {
            payload.teacherWagePerSession = Number(values.teacherWagePerSession);
            payload.type = 'teacher';
          } else if (editState.mode === 'taWage') {
            payload.taWagePerSession = Number(values.taWagePerSession || 0);
            payload.type = 'ta';
          }
          payload.effectiveFrom = values.effectiveFrom.format('YYYY-MM-DD');
          payload.effectiveTo = values.effectiveTo
            ? values.effectiveTo.format('YYYY-MM-DD')
            : null;

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
        const classListHtml = (
          <ul style={{ paddingLeft: '16px', margin: '8px 0 0 0', maxHeight: '150px', overflowY: 'auto' }}>
            {activeClasses.map((c: any) => (
              <li key={c.id}>
                <strong>[{c.classCode}]</strong> {c.className}
              </li>
            ))}
          </ul>
        );

        setSubmittingEditPricing(false);
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
          },
        });
      } else {
        await proceedSave();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể kiểm tra danh sách lớp bị ảnh hưởng.');
      setSubmittingEditPricing(false);
    }
  };

  const pricingList = selectedLevel?.pricing || [];

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

  const studentPricing = sortPricingNewestFirst(
    [...pricingList].filter((p) => (p.type ? p.type === 'student' : Number(p.pricePerSession) > 0)),
  );
  const teacherPricing = sortPricingNewestFirst(
    [...pricingList].filter((p) => (p.type ? p.type === 'teacher' : Number(p.teacherWagePerSession) > 0)),
  );
  const taPricing = sortPricingNewestFirst(
    [...pricingList].filter((p) => (p.type ? p.type === 'ta' : Number(p.taWagePerSession) > 0)),
  );

  const currentTypeRecords =
    editState.mode === 'price'
      ? studentPricing
      : editState.mode === 'teacherWage'
      ? teacherPricing
      : editState.mode === 'taWage'
      ? taPricing
      : [];
  const hasExistingRecords = currentTypeRecords.length > 0;

  return (
    <>
      <Modal
        title={`Cấu hình đơn giá & lương: ${selectedLevel?.levelName}`}
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Đóng
          </Button>,
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                      marginTop: 16,
                    }}
                  >
                    <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      Lịch sử đơn giá học viên
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setEditState({ open: true, mode: 'price', record: null })}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderColor: '#10b981',
                      }}
                    >
                      Thêm đơn giá mới
                    </Button>
                  </div>
                  <PricingHistoryTable
                    dataSource={studentPricing}
                    mode="price"
                    rateField="pricePerSession"
                    rateLabel="Đơn giá học viên / buổi"
                    rateColor="#10b981"
                    lockField="isStudentPriceLocked"
                    lastBillDate={lastStudentBillDate}
                    billTooltip="Đã có học viên được tính học phí trong khoảng thời gian này, không thể xóa"
                    onEdit={(record) => setEditState({ open: true, mode: 'price', record })}
                    onDelete={handleDeletePricing}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                      marginTop: 16,
                    }}
                  >
                    <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      Lịch sử lương giáo viên
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setEditState({ open: true, mode: 'teacherWage', record: null })}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderColor: '#f59e0b',
                      }}
                    >
                      Thêm lương mới
                    </Button>
                  </div>
                  <PricingHistoryTable
                    dataSource={teacherPricing}
                    mode="teacherWage"
                    rateField="teacherWagePerSession"
                    rateLabel="Lương giáo viên / buổi"
                    rateColor="#f59e0b"
                    lockField="isTeacherWageLocked"
                    lastBillDate={lastTeacherWageDate}
                    billTooltip="Đã có giáo viên được chốt lương trong khoảng thời gian này, không thể xóa"
                    onEdit={(record) => setEditState({ open: true, mode: 'teacherWage', record })}
                    onDelete={handleDeletePricing}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                      marginTop: 16,
                    }}
                  >
                    <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      Lịch sử lương trợ giảng
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setEditState({ open: true, mode: 'taWage', record: null })}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderColor: '#3b82f6',
                      }}
                    >
                      Thêm lương mới
                    </Button>
                  </div>
                  <PricingHistoryTable
                    dataSource={taPricing}
                    mode="taWage"
                    rateField="taWagePerSession"
                    rateLabel="Lương trợ giảng / buổi"
                    rateColor="#60a5fa"
                    lockField="isTaWageLocked"
                    lastBillDate={lastAssistantWageDate}
                    billTooltip="Đã có trợ giảng được chốt lương trong khoảng thời gian này, không thể xóa"
                    onEdit={(record) => setEditState({ open: true, mode: 'taWage', record })}
                    onDelete={handleDeletePricing}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <EditPricingModal
        open={editState.open}
        mode={editState.mode}
        record={editState.record}
        hasExistingRecords={hasExistingRecords}
        submitting={submittingEditPricing}
        lastStudentBillDate={lastStudentBillDate}
        lastTeacherWageDate={lastTeacherWageDate}
        lastAssistantWageDate={lastAssistantWageDate}
        onCancel={() => setEditState({ open: false, mode: null, record: null })}
        onSubmit={handleEditPricingSubmit}
      />
    </>
  );
};

export default LevelPricingModal;

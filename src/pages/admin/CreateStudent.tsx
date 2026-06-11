import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  UserPlus, Save, X, CheckCircle, AlertCircle,
  User, Phone, Mail, Calendar, MapPin, FileText,
  Hash, Users, ChevronDown
} from 'lucide-react';

interface CreateStudentForm {
  firstName: string;
  lastName: string;
  nickName: string;
  gender: string;
  mobile: string;
  email: string;
  birthdate: string;
  parentName: string;
  relationship: string;
  citizenId: string;
  status: string;
  primaryAddress: string;
  description: string;
}

const INITIAL_FORM: CreateStudentForm = {
  firstName: '',
  lastName: '',
  nickName: '',
  gender: '',
  mobile: '',
  email: '',
  birthdate: '',
  parentName: '',
  relationship: '',
  citizenId: '',
  status: 'Waiting for class',
  primaryAddress: '',
  description: '',
};

const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'];
const STATUS_OPTIONS = [
  { value: 'Waiting for class', label: 'Chờ xếp lớp' },
  { value: 'Studying', label: 'Đang học' },
  { value: 'Suspended', label: 'Tạm nghỉ' },
  { value: 'Graduated', label: 'Đã tốt nghiệp' },
];
const RELATIONSHIP_OPTIONS = ['Bố', 'Mẹ', 'Anh', 'Chị', 'Ông', 'Bà', 'Người giám hộ khác'];

export const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateStudentForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<CreateStudentForm>>({});

  const handleChange = (field: keyof CreateStudentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<CreateStudentForm> = {};
    if (!form.firstName.trim()) errors.firstName = 'Vui lòng nhập tên học sinh';
    if (!form.lastName.trim()) errors.lastName = 'Vui lòng nhập họ học sinh';
    if (!form.gender) errors.gender = 'Vui lòng chọn giới tính';
    if (!form.mobile.trim()) errors.mobile = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(form.mobile.replace(/\s/g, ''))) errors.mobile = 'Số điện thoại không hợp lệ';
    if (!form.birthdate) errors.birthdate = 'Vui lòng chọn ngày sinh';
    if (!form.status) errors.status = 'Vui lòng chọn trạng thái';
    if (!form.primaryAddress.trim()) errors.primaryAddress = 'Vui lòng nhập địa chỉ';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nickName: form.nickName.trim() || undefined,
        gender: form.gender,
        mobile: form.mobile.trim(),
        email: form.email.trim() || undefined,
        birthdate: form.birthdate,
        parentName: form.parentName.trim() || undefined,
        relationship: form.relationship || undefined,
        citizenId: form.citizenId.trim() || undefined,
        status: form.status,
        primaryAddress: form.primaryAddress.trim(),
        description: form.description.trim() || undefined,
      };
      const response = await api.post('/students', payload);
      setSuccess(`Đã tạo thành công học sinh: ${response.data.lastName} ${response.data.firstName} — Mã: ${response.data.id}`);
      setForm(INITIAL_FORM);
      setFieldErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) setError(msg.join(', '));
      else setError(msg || 'Không thể tạo học sinh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/students');
  };

  const InputField: React.FC<{
    label: string;
    icon: React.ReactNode;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
  }> = ({ label, icon, required, error, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        {label}
        {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.78rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );

  const inputStyle = (hasError?: string): React.CSSProperties => ({
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-secondary)',
    border: `1px solid ${hasError ? 'rgba(239, 68, 68, 0.5)' : 'var(--card-border)'}`,
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-primary)',
    fontSize: '0.93rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
  });

  const selectStyle = (hasError?: string): React.CSSProperties => ({
    ...inputStyle(hasError),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%239ca3af' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '40px',
    cursor: 'pointer',
  });

  const sectionStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px 28px',
  };

  const sectionTitle = (title: string, icon: React.ReactNode) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      paddingBottom: '12px', marginBottom: '4px',
      borderBottom: '1px solid var(--card-border)'
    }}>
      <span style={{ color: 'var(--primary)' }}>{icon}</span>
      <h3 style={{ fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '11px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 4px 15px var(--primary-glow)'
            }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
                Thêm Học sinh mới
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                Điền thông tin hồ sơ để đăng ký học sinh vào hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Status & Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái:</span>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              style={{
                ...selectStyle(),
                width: 'auto', padding: '8px 36px 8px 12px',
                fontSize: '0.85rem',
                color: form.status === 'Waiting for class' ? '#f59e0b' 
                      : form.status === 'Studying' ? 'var(--secondary)' 
                      : form.status === 'Suspended' ? 'var(--danger)' 
                      : 'var(--primary)',
              }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleCancel} className="btn btn-outline" style={{ padding: '10px 18px' }}>
            <X size={16} /> Hủy
          </button>
          <button
            form="create-student-form"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '10px 22px', animation: loading ? 'pulse-glow 1.5s infinite' : 'none' }}
          >
            <Save size={16} />
            {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '14px 18px', marginBottom: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          display: 'flex', alignItems: 'center', gap: '12px',
          color: '#6ee7b7', fontSize: '0.93rem'
        }}>
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <div>{success}</div>
        </div>
      )}
      {error && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '14px 18px', marginBottom: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          display: 'flex', alignItems: 'center', gap: '12px',
          color: '#fca5a5', fontSize: '0.93rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Form */}
      <form id="create-student-form" onSubmit={handleSubmit}>
        {/* Tabs mockup */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '0' }}>
          {['Thông tin chung', 'Tài khoản đăng nhập', 'Gói học'].map((tab, idx) => (
            <div key={tab} style={{
              padding: '10px 20px', fontSize: '0.9rem', fontWeight: idx === 0 ? 600 : 500,
              color: idx === 0 ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: idx === 0 ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: idx === 0 ? 'default' : 'not-allowed',
              marginBottom: '-1px', userSelect: 'none'
            }}>
              {tab}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1 - Basic Info */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            {sectionTitle('Thông tin cơ bản', <User size={18} />)}
            <div style={sectionStyle}>
              {/* Avatar placeholder + Ho Ten */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '2px dashed var(--card-border)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, gap: '4px'
                }}>
                  <User size={24} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>Ảnh đại diện</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px 28px', flex: 1 }}>
                  <InputField label="Họ" icon={<User size={13} />} required error={fieldErrors.lastName}>
                    <input
                      type="text"
                      placeholder="Nguyễn Bình"
                      style={inputStyle(fieldErrors.lastName)}
                      value={form.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                      onBlur={(e) => { e.target.style.borderColor = fieldErrors.lastName ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </InputField>

                  <InputField label="Tên" icon={<User size={13} />} required error={fieldErrors.firstName}>
                    <input
                      type="text"
                      placeholder="Minh"
                      style={inputStyle(fieldErrors.firstName)}
                      value={form.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                      onBlur={(e) => { e.target.style.borderColor = fieldErrors.firstName ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </InputField>

                  <InputField label="Biệt danh / Tên gọi" icon={<User size={13} />}>
                    <input
                      type="text"
                      placeholder="Minh Còi"
                      style={inputStyle()}
                      value={form.nickName}
                      onChange={(e) => handleChange('nickName', e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </InputField>

                  <InputField label="Mã học sinh" icon={<Hash size={13} />}>
                    <div style={{
                      ...inputStyle(),
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: 'var(--text-muted)', cursor: 'not-allowed',
                      background: 'rgba(0,0,0,0.2)'
                    }}>
                      <Hash size={14} />
                      <span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Tự động sinh (STU-XXXX)</span>
                    </div>
                  </InputField>
                </div>
              </div>

              {/* Gender */}
              <InputField label="Giới tính" icon={<Users size={13} />} required error={fieldErrors.gender}>
                <select
                  style={selectStyle(fieldErrors.gender)}
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">-- Chọn giới tính --</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </InputField>

              {/* Birthdate */}
              <InputField label="Ngày sinh" icon={<Calendar size={13} />} required error={fieldErrors.birthdate}>
                <input
                  type="date"
                  style={inputStyle(fieldErrors.birthdate)}
                  value={form.birthdate}
                  onChange={(e) => handleChange('birthdate', e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = fieldErrors.birthdate ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </InputField>

              {/* Age (computed) */}
              <InputField label="Tuổi" icon={<Calendar size={13} />}>
                <div style={{
                  ...inputStyle(),
                  color: 'var(--text-muted)', cursor: 'not-allowed',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  {form.birthdate
                    ? `${Math.floor((Date.now() - new Date(form.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000))} tuổi`
                    : 'Chưa có dữ liệu'}
                </div>
              </InputField>

              {/* CCCD */}
              <InputField label="CCCD / CMND học sinh" icon={<Hash size={13} />}>
                <input
                  type="text"
                  placeholder="046095001234"
                  style={inputStyle()}
                  value={form.citizenId}
                  onChange={(e) => handleChange('citizenId', e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </InputField>
            </div>
          </div>

          {/* Section 2 - Contact */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            {sectionTitle('Thông tin liên lạc', <Phone size={18} />)}
            <div style={sectionStyle}>
              <InputField label="Số điện thoại" icon={<Phone size={13} />} required error={fieldErrors.mobile}>
                <input
                  type="tel"
                  placeholder="0987 654 321"
                  style={inputStyle(fieldErrors.mobile)}
                  value={form.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = fieldErrors.mobile ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </InputField>

              <InputField label="Email" icon={<Mail size={13} />}>
                <input
                  type="email"
                  placeholder="binhminh@gmail.com"
                  style={inputStyle()}
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </InputField>

              <InputField label="Địa chỉ chính" icon={<MapPin size={13} />} required error={fieldErrors.primaryAddress}>
                <input
                  type="text"
                  placeholder="123 Đường Lê Lợi, Thành phố Huế, Việt Nam"
                  style={inputStyle(fieldErrors.primaryAddress)}
                  value={form.primaryAddress}
                  onChange={(e) => handleChange('primaryAddress', e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = fieldErrors.primaryAddress ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </InputField>
            </div>
          </div>

          {/* Section 3 - Parent Info */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            {sectionTitle('Thông tin Phụ huynh / Người giám hộ', <Users size={18} />)}
            <div style={sectionStyle}>
              <InputField label="Họ tên Phụ huynh / Người giám hộ" icon={<User size={13} />}>
                <input
                  type="text"
                  placeholder="Nguyễn Văn Hùng"
                  style={inputStyle()}
                  value={form.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </InputField>

              <InputField label="Quan hệ với học sinh" icon={<ChevronDown size={13} />}>
                <select
                  style={selectStyle()}
                  value={form.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                >
                  <option value="">-- Chọn quan hệ --</option>
                  {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </InputField>
            </div>
          </div>

          {/* Section 4 - Notes */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            {sectionTitle('Ghi chú', <FileText size={18} />)}
            <div>
              <label style={{
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px'
              }}>
                Mô tả / Ghi chú thêm
              </label>
              <textarea
                rows={4}
                placeholder="Học sinh hiếu động, có năng khiếu Toán, tham gia câu lạc bộ cờ vua..."
                style={{
                  ...inputStyle(),
                  resize: 'vertical', minHeight: '100px',
                }}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '12px',
          marginTop: '24px', paddingTop: '20px',
          borderTop: '1px solid var(--card-border)'
        }}>
          <button type="button" onClick={handleCancel} className="btn btn-outline" style={{ padding: '12px 28px' }}>
            <X size={16} /> Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '12px 32px', fontSize: '0.98rem', animation: loading ? 'pulse-glow 1.5s infinite' : 'none' }}
          >
            <Save size={18} />
            {loading ? 'Đang lưu hồ sơ...' : 'Lưu hồ sơ học sinh'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudent;

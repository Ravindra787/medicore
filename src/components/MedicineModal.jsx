import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Pill,
  Droplet,
  Syringe,
  Wind,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/dateUtils';

const MEDICINE_TYPES = [
  { id: 'tablet', label: 'Tablet', icon: Pill },
  { id: 'capsule', label: 'Capsule', icon: Pill },
  { id: 'syrup', label: 'Syrup', icon: Droplet },
  { id: 'drops', label: 'Drops', icon: Droplet },
  { id: 'inhaler', label: 'Inhaler', icon: Wind },
  { id: 'injection', label: 'Injection', icon: Syringe },
  { id: 'other', label: 'Other', icon: Sparkles },
];

const FOOD_INSTRUCTIONS = [
  { id: 'before_food', label: 'Before Food' },
  { id: 'after_food', label: 'After Food' },
  { id: 'with_food', label: 'With Food' },
  { id: 'anytime', label: 'Anytime' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COLOR_OPTIONS = [
  '#8B7CFF', // Purple
  '#39D6B4', // Teal
  '#FFBE55', // Amber
  '#FF6B81', // Rose
  '#38BDF8', // Cyan
  '#A78BFA', // Lavender
  '#F472B6', // Pink
];

export const MedicineModal = () => {
  const {
    isMedicineModalOpen,
    editingMedicine,
    closeMedicineModal,
    addMedicine,
    updateMedicine,
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    type: 'tablet',
    instructions: 'after_food',
    startDate: getLocalDateString(),
    endDate: '',
    times: ['08:00'],
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    notes: '',
    color: '#8B7CFF',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name || '',
        dosage: editingMedicine.dosage || '',
        type: editingMedicine.type || 'tablet',
        instructions: editingMedicine.instructions || 'after_food',
        startDate: editingMedicine.startDate || getLocalDateString(),
        endDate: editingMedicine.endDate || '',
        times: editingMedicine.times && editingMedicine.times.length ? [...editingMedicine.times] : ['08:00'],
        frequency: editingMedicine.frequency || 'daily',
        days: editingMedicine.days && editingMedicine.days.length ? [...editingMedicine.days] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        notes: editingMedicine.notes || '',
        color: editingMedicine.color || '#8B7CFF',
      });
    } else {
      setFormData({
        name: '',
        dosage: '',
        type: 'tablet',
        instructions: 'after_food',
        startDate: getLocalDateString(),
        endDate: '',
        times: ['08:00'],
        frequency: 'daily',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        notes: '',
        color: '#8B7CFF',
      });
    }
    setErrors({});
  }, [editingMedicine, isMedicineModalOpen]);

  if (!isMedicineModalOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Medicine name is required';
    if (!formData.dosage.trim()) errs.dosage = 'Dosage is required (e.g., 1 tablet)';
    if (!formData.startDate) errs.startDate = 'Start date is required';
    if (formData.endDate && formData.endDate < formData.startDate) {
      errs.endDate = 'End date cannot be earlier than start date';
    }
    if (!formData.times || formData.times.length === 0) {
      errs.times = 'At least one reminder time is required';
    } else if (formData.times.some((t) => !t)) {
      errs.times = 'All reminder times must be valid';
    }
    if (formData.frequency === 'selected_days' && (!formData.days || formData.days.length === 0)) {
      errs.days = 'Select at least one day of the week';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, formData);
    } else {
      addMedicine(formData);
    }
    closeMedicineModal();
  };

  const handleAddTime = () => {
    setFormData((prev) => ({
      ...prev,
      times: [...prev.times, '12:00'],
    }));
  };

  const handleRemoveTime = (index) => {
    if (formData.times.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData((prev) => ({ ...prev, times: newTimes }));
  };

  const toggleDay = (day) => {
    let updatedDays = [...formData.days];
    if (updatedDays.includes(day)) {
      if (updatedDays.length > 1) {
        updatedDays = updatedDays.filter((d) => d !== day);
      }
    } else {
      updatedDays.push(day);
    }
    setFormData((prev) => ({ ...prev, days: updatedDays }));
  };

  return (
    <div className="modal-overlay" onClick={closeMedicineModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 124, 255, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pill size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingMedicine ? 'Edit Medication' : 'Add New Medication'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Fill in the details to configure dosage and reminder schedules
              </p>
            </div>
          </div>
          <button onClick={closeMedicineModal} style={{ color: 'var(--text-muted)' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Medicine Name & Dosage */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Medicine Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin, Metformin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Dosage <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg (1 tab), 5 ml"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                />
                {errors.dosage && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.dosage}</span>}
              </div>
            </div>

            {/* Medicine Type Selector */}
            <div className="form-group">
              <label className="form-label">Medicine Form / Type</label>
              <div className="type-selector-grid">
                {MEDICINE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = formData.type === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      className={`type-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, type: t.id })}
                    >
                      <Icon size={18} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Food Instructions */}
            <div className="form-group">
              <label className="form-label">Meal & Food Instructions</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {FOOD_INSTRUCTIONS.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    className={`filter-btn ${formData.instructions === f.id ? 'active' : ''}`}
                    style={{ textAlign: 'center', fontSize: '12px', padding: '8px 4px' }}
                    onClick={() => setFormData({ ...formData, instructions: f.id })}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates: Start & End */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                {errors.startDate && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  End Date <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Optional / Ongoing)</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                {errors.endDate && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.endDate}</span>}
              </div>
            </div>

            {/* Reminder Times */}
            <div className="form-group">
              <div className="form-label">
                <span>Reminder Times <span className="required">*</span></span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddTime}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                  <Plus size={13} /> Add Time
                </button>
              </div>

              <div className="times-input-wrapper">
                {formData.times.map((time, idx) => (
                  <div key={idx} className="time-row">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() => handleRemoveTime(idx)}
                        title="Remove this time"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.times && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.times}</span>}
            </div>

            {/* Frequency: Daily vs Specific Days */}
            <div className="form-group">
              <label className="form-label">Intake Frequency</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <button
                  type="button"
                  className={`filter-btn ${formData.frequency === 'daily' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, frequency: 'daily' })}
                >
                  Every Day
                </button>
                <button
                  type="button"
                  className={`filter-btn ${formData.frequency === 'selected_days' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, frequency: 'selected_days' })}
                >
                  Specific Days of Week
                </button>
              </div>

              {formData.frequency === 'selected_days' && (
                <div>
                  <div className="days-selector">
                    {WEEKDAYS.map((day) => {
                      const isSelected = formData.days.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          className={`day-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {errors.days && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.days}</span>}
                </div>
              )}
            </div>

            {/* Accent Color Badge */}
            <div className="form-group">
              <label className="form-label">Card Tag Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setFormData({ ...formData, color: c })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: formData.color === c ? '3px solid #FFFFFF' : '2px solid transparent',
                      boxShadow: formData.color === c ? `0 0 10px ${c}` : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="form-group">
              <label className="form-label">
                Doctor Instructions & Notes <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Take with a full glass of water. Do not lie down for 30 minutes."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={closeMedicineModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMedicine ? 'Save Changes' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


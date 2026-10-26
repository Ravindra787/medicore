import React, { useState } from 'react';
import {
  Plus,
  Pill,
  Droplet,
  Syringe,
  Wind,
  Sparkles,
  Clock,
  Calendar,
  Utensils,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, formatTime12h } from '../utils/dateUtils';

export const MedicinesView = () => {
  const {
    medicines,
    searchTerm,
    setSearchTerm,
    openAddModal,
    openEditModal,
    openViewModal,
    promptConfirm,
    deleteMedicine,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState('all');

  const getTypeIcon = (type) => {
    switch (type) {
      case 'capsule':
      case 'tablet':
        return <Pill size={20} />;
      case 'syrup':
      case 'drops':
        return <Droplet size={20} />;
      case 'inhaler':
        return <Wind size={20} />;
      case 'injection':
        return <Syringe size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    // Type filter
    if (typeFilter !== 'all' && med.type !== typeFilter) return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = med.name.toLowerCase().includes(q);
      const matchDosage = med.dosage.toLowerCase().includes(q);
      const matchNotes = med.notes && med.notes.toLowerCase().includes(q);
      if (!matchName && !matchDosage && !matchNotes) return false;
    }

    return true;
  });

  const handleDelete = (med) => {
    promptConfirm({
      title: `Delete ${med.name}?`,
      message: `Are you sure you want to remove ${med.name}? All future reminders for this medication will be stopped.`,
      confirmText: 'Delete Medicine',
      isDanger: true,
      onConfirm: () => deleteMedicine(med.id),
    });
  };

  return (
    <div className="medicines-view">
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">My Medications</h1>
          <p className="welcome-subtitle">
            Manage your prescriptions, dosages, and custom reminder schedules
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="medicines-filter-bar">
        <div className="filter-group">
          {['all', 'tablet', 'capsule', 'syrup', 'drops', 'inhaler', 'injection'].map((t) => (
            <button
              key={t}
              className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon-box">
              <Pill size={32} />
            </div>
            <h4 className="empty-title">
              {searchTerm || typeFilter !== 'all'
                ? 'No matching medications found'
                : 'No medications added yet'}
            </h4>
            <p className="empty-desc">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search terms or filters to find what you need.'
                : 'Start organizing your health regimen by adding your first medicine.'}
            </p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} /> Add First Medicine
            </button>
          </div>
        </div>
      ) : (
        <div className="medicines-grid">
          {filteredMedicines.map((med) => {
            const cardColor = med.color || '#8B7CFF';

            return (
              <div
                key={med.id}
                className="medicine-card"
                style={{ borderTop: `3px solid ${cardColor}` }}
              >
                <div>
                  <div className="medicine-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        className="medicine-type-icon"
                        style={{
                          backgroundColor: `${cardColor}22`,
                          color: cardColor,
                          border: `1px solid ${cardColor}44`,
                        }}
                      >
                        {getTypeIcon(med.type)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 className="medicine-card-title">{med.name}</h3>
                          {med.isDemo && <span className="badge badge-demo">Demo</span>}
                        </div>
                        <p className="medicine-card-dosage">{med.dosage}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Times */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                      REMINDER TIMES
                    </div>
                    <div className="medicine-times-list">
                      {med.times && med.times.map((t, idx) => (
                        <span key={idx} className="time-chip">
                          {formatTime12h(t)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span className="badge badge-food">
                      <Utensils size={11} /> {med.instructions.replace('_', ' ')}
                    </span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      <Calendar size={11} />
                      {med.frequency === 'daily'
                        ? 'Every day'
                        : `${med.days ? med.days.length : 0} days/wk`}
                    </span>
                  </div>

                  {/* Notes snippet */}
                  {med.notes && <p className="medicine-card-notes">"{med.notes}"</p>}
                </div>

                {/* Actions */}
                <div className="medicine-card-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openViewModal(med)}
                  >
                    <Eye size={13} /> View
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openEditModal(med)}
                      title="Edit medicine"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(med)}
                      title="Delete medicine"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api.js';
import {
  FiSend,
  FiCpu,
  FiCheckCircle,
  FiTarget,
  FiEye,
  FiTool,
  FiAward,
  FiXCircle,
  FiLoader,
  FiInfo,
  FiX,  
  FiAlertCircle,
  FiMaximize2
} from 'react-icons/fi';
import {
  PiTrafficConeBold,
  PiRoadHorizonBold
} from 'react-icons/pi';
import { TbAlertTriangle, TbActivity } from 'react-icons/tb';
import { BsLightbulb } from 'react-icons/bs';

const STATUS_CONFIG = {
  pending:     { icon: FiCpu,         label: 'Menunggu Verifikasi', color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  submitted:   { icon: FiSend,        label: 'Terkirim',            color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  validating:  { icon: FiCpu,         label: 'Divalidasi AI',       color: '#FF9F0A', bg: 'rgba(255, 159, 10, 0.15)', border: 'rgba(255, 159, 10, 0.3)' },
  validated:   { icon: FiCheckCircle, label: 'Terverifikasi',       color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)',  border: 'rgba(48, 209, 88, 0.3)' },
  prioritized: { icon: FiTarget,      label: 'Diprioritaskan',      color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)',  border: 'rgba(48, 209, 88, 0.3)' },
  reviewed:    { icon: FiEye,         label: 'Ditinjau',            color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  in_progress: { icon: FiTool,        label: 'Sedang Dikerjakan',   color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)', border: 'rgba(10, 132, 255, 0.3)' },
  resolved:    { icon: FiAward,       label: 'Selesai Ditangani',   color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)',  border: 'rgba(48, 209, 88, 0.3)' },
  rejected:    { icon: FiXCircle,     label: 'Ditolak',             color: '#FF453A', bg: 'rgba(255, 69, 58, 0.15)',  border: 'rgba(255, 69, 58, 0.3)' }
};

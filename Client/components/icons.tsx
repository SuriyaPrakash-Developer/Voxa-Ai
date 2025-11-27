import * as React from 'react';
import {
  MdMic,
  MdStop,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLock,
  MdSend,
  MdAdd,
  MdExpandMore,
  MdExpandLess,
  MdMenu,
  MdClose,
  MdEdit,
  MdRefresh,
  MdAutoAwesome
} from 'react-icons/md';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdMic className={className || "w-5 h-5"} />
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdStop className={className || "w-5 h-5"} />
);

export const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdAutoAwesome className={className || "w-5 h-5"} />
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdPerson className={className || "w-5 h-5"} />);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdEmail className={className || "w-5 h-5"} />
);

export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdPhone className={className || "w-5 h-5"} />
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdLock className={className || "w-5 h-5"} />
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdSend className={className || "w-5 h-5"} />
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdAdd className={className || "w-5 h-5"} />
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdExpandMore className={className || "w-5 h-5"} />
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdExpandLess className={className || "w-5 h-5"} />
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdMenu className={className || "w-5 h-5"} />
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdClose className={className || "w-5 h-5"} />
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdEdit className={className || "w-5 h-5"} />
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MdRefresh className={className || "w-5 h-5"} />
);
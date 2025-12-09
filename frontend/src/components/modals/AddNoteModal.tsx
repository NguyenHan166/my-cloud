import { useState, useEffect } from 'react';
import { classNames } from '@/utils/classNames';
import { Button, IconButton, Input, Textarea } from '@/components/common';
import { X, StickyNote, Plus } from 'lucide-react';
import { useTagsStore } from '@/stores';
import { createItem, updateItem } from '@/api/libraryApi';
import type { Item } from '@/types/domain';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (message: string) => void;
  note?: Item | null; // For edit mode
}

interface NewTagData {
  name: string;
  color: string;
}

// Map form importance to API importance
const mapImportance = (value: 'low' | 'normal' | 'high') => {
  const map = { low: 'LOW', normal: 'MEDIUM', high: 'HIGH' } as const;
  return map[value];
};

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  note,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [project, setProject] = useState('');
  const [importance, setImportance] = useState<'low' | 'normal' | 'high'>('normal');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTags, setNewTags] = useState<NewTagData[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');
  const [isLoading, setIsLoading] = useState(false);

  const TAG_COLORS = [
    '#6366F1', '#22C55E', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'
  ];

  const { tags, loadTags } = useTagsStore();

  const isEditMode = !!note;

  // Load tags when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen, loadTags]);

  // Pre-fill form when editing
  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || '');
      setProject(note.project || '');
      setImportance((note.importance?.toLowerCase() as 'low' | 'normal' | 'high') || 'normal');
      setSelectedTags(note.tags?.map(t => t.id) || []);
    } else if (!isOpen) {
      // Reset form when closed
      setTitle('');
      setContent('');
      setCategory('');
      setProject('');
      setImportance('normal');
      setSelectedTags([]);
      setNewTags([]);
      setNewTagName('');
      setNewTagColor('#6366F1');
    }
  }, [note, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    
    try {
      if (isEditMode && note) {
        // Update existing note
        const result = await updateItem(note.id, {
          title: title.trim(),
          content,
          category: category || undefined,
          project: project || undefined,
          importance: mapImportance(importance),
          tagIds: selectedTags,
          newTags,
        });
        onSubmit?.(result.message);
      } else {
        // Create new note
        const result = await createItem({
          type: 'NOTE',
          title: title.trim(),
          content,
          category: category || undefined,
          project: project || undefined,
          importance: mapImportance(importance),
          tagIds: selectedTags,
          newTags,
        });
        onSubmit?.(result.message);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setProject('');
    setImportance('normal');
    setSelectedTags([]);
    setNewTags([]);
    setNewTagName('');
    setNewTagColor('#6366F1');
    onClose();
  };

  const handleAddNewTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (tags.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return;
    if (newTags.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return;
    
    setNewTags(prev => [...prev, { name: trimmed, color: newTagColor }]);
    setNewTagName('');
  };

  const handleRemoveNewTag = (name: string) => {
    setNewTags(prev => prev.filter(t => t.name !== name));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:top-[10%] md:bottom-auto z-50 bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StickyNote className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-text">
              {isEditMode ? 'Edit Note' : 'New Note'}
            </h2>
          </div>
          <IconButton
            aria-label="Close"
            icon={<X className="w-full h-full" />}
            onClick={handleClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-1">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here... (Markdown supported)"
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Category & Project */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Work, Personal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Project
              </label>
              <Input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g., Cloud Platform"
              />
            </div>
          </div>

          {/* Importance */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Importance
            </label>
            <div className="flex gap-2">
              {(['low', 'normal', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setImportance(level)}
                  className={classNames(
                    'px-4 py-2 text-sm rounded-lg border transition-colors capitalize flex-1',
                    importance === level
                      ? level === 'high'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : level === 'low'
                        ? 'bg-gray-100 text-gray-600 border-gray-300'
                        : 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-muted border-border hover:border-gray-300'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={classNames(
                    'px-3 py-1 text-sm rounded-full border transition-colors',
                    selectedTags.includes(tag.id)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-white text-muted border-border hover:border-primary/30'
                  )}
                >
                  {tag.name}
                </button>
              ))}
              {newTags.map((tag) => (
                <button
                  key={`new-${tag.name}`}
                  onClick={() => handleRemoveNewTag(tag.name)}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-dashed border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  title="Click to remove"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex items-center gap-1">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={classNames(
                      'w-5 h-5 rounded-full transition-transform',
                      newTagColor === color && 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
              />
              <IconButton
                aria-label="Add new tag"
                icon={<Plus className="w-full h-full" />}
                onClick={handleAddNewTag}
                disabled={!newTagName.trim()}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-gray-50">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            loading={isLoading}
          >
            {isEditMode ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </div>
    </>
  );
};

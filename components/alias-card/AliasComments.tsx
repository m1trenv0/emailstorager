'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, MessageSquare } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AliasCommentsProps {
  aliasId: string;
  comments: string | null;
  isUpdating: boolean;
  onCommentUpdate?: (comment: string) => Promise<void>;
}

export function AliasComments({
  aliasId,
  comments,
  isUpdating,
  onCommentUpdate,
}: AliasCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comments || '');

  const handleSave = async () => {
    if (!onCommentUpdate) return;
    try {
      await onCommentUpdate(editedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCancel = () => {
    setEditedComment(comments || '');
    setIsEditing(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70">
          <ChevronDown
            className="h-3 w-3 transition-transform"
            style={{
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
          />
          <MessageSquare className="h-3 w-3" />
          <span className="text-xs font-medium text-muted-foreground">
            Comments
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              placeholder="Add your comments here..."
              rows={2}
              className="resize-none text-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-6 text-xs"
                onClick={handleSave}
                disabled={isUpdating}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {comments ? (
              <div className="rounded bg-muted px-2 py-1">
                <p className="text-xs whitespace-pre-wrap">{comments}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic px-2">
                No comments yet
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full h-6 text-xs"
              onClick={() => setIsEditing(true)}
            >
              {comments ? 'Edit' : 'Add Comment'}
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusIcon } from './StatusIcon';
import { AliasWithStatus, ServiceStatus } from '@/lib/types';
import { Mail, Calendar } from 'lucide-react';

interface AliasCardProps {
  alias: AliasWithStatus;
  onStatusUpdate?: (
    aliasId: string,
    service: 'aliexpress' | 'augment',
    status: ServiceStatus
  ) => Promise<void>;
  onCommentUpdate?: (aliasId: string, comment: string) => Promise<void>;
}

export function AliasCard({
  alias,
  onStatusUpdate,
  onCommentUpdate,
}: AliasCardProps) {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [comment, setComment] = useState(alias.comments || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveComment = async () => {
    if (!onCommentUpdate) return;
    setIsUpdating(true);
    try {
      await onCommentUpdate(alias.id, comment);
      setIsEditingComment(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    service: 'aliexpress' | 'augment',
    newStatus: ServiceStatus
  ) => {
    if (!onStatusUpdate) return;
    setIsUpdating(true);
    try {
      await onStatusUpdate(alias.id, service, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          {alias.email}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created: {formatDate(alias.createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Statuses */}
        <section className="space-y-3">
          <Label>Service Status</Label>

          {/* AliExpress Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">AliExpress</Badge>
              {alias.status.aliexpress && (
                <StatusIcon status={alias.status.aliexpress} />
              )}
            </div>
            <div className="flex gap-1">
              {(['pending', 'registered', 'banned', 'delivered'] as const).map(
                (status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={
                      alias.status.aliexpress === status ? 'default' : 'outline'
                    }
                    onClick={() => handleStatusChange('aliexpress', status)}
                    disabled={isUpdating}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Augment Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Augment</Badge>
              {alias.status.augment && (
                <StatusIcon status={alias.status.augment} />
              )}
            </div>
            <div className="flex gap-1">
              {(['pending', 'registered', 'banned', 'delivered'] as const).map(
                (status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={
                      alias.status.augment === status ? 'default' : 'outline'
                    }
                    onClick={() => handleStatusChange('augment', status)}
                    disabled={isUpdating}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="space-y-2">
          <Label htmlFor={`comment-${alias.id}`}>Comments</Label>
          {isEditingComment ? (
            <div className="space-y-2">
              <Textarea
                id={`comment-${alias.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comments here..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveComment}
                  disabled={isUpdating}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setComment(alias.comments || '');
                    setIsEditingComment(false);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="min-h-[60px] rounded-md border p-3 text-sm">
                {alias.comments || 'No comments yet.'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingComment(true)}
              >
                Edit Comment
              </Button>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

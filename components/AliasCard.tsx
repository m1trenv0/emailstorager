'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AliasWithStatus, ServiceFieldValue } from '@/lib/types';
import { getServiceField } from '@/lib/service-utils';
import { Mail, Calendar, CheckCircle, XCircle, Package } from 'lucide-react';

interface AliasCardProps {
  alias: AliasWithStatus;
  onServiceFieldUpdate?: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate?: (aliasId: string, comment: string) => Promise<void>;
}

export function AliasCard({
  alias,
  onServiceFieldUpdate,
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

  const handleFieldUpdate = async (
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    if (!onServiceFieldUpdate) return;
    setIsUpdating(true);
    try {
      await onServiceFieldUpdate(alias.id, serviceName, fieldName, value);
    } catch (error) {
      console.error('Failed to update field:', error);
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

  const renderServiceStatus = (serviceName: string) => {
    const serviceStatus = alias.status[serviceName];
    if (!serviceStatus) return null;

    // Determine status badge based on service fields
    let statusLabel = 'Unknown';
    let statusIcon = null;
    let statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' =
      'secondary';

    if (serviceName.toLowerCase() === 'aliexpress') {
      const isBanned = getServiceField(alias.status, serviceName, 'isBanned');
      const isDelivered = getServiceField(
        alias.status,
        serviceName,
        'isDelivered'
      );
      const registerDate = getServiceField(
        alias.status,
        serviceName,
        'registerDate'
      );

      if (isBanned === true) {
        statusLabel = 'Banned';
        statusIcon = <XCircle className="h-4 w-4" />;
        statusVariant = 'destructive';
      } else if (isDelivered === true) {
        statusLabel = 'Delivered';
        statusIcon = <Package className="h-4 w-4" />;
        statusVariant = 'default';
      } else if (registerDate) {
        statusLabel = 'Registered';
        statusIcon = <CheckCircle className="h-4 w-4" />;
        statusVariant = 'default';
      } else {
        statusLabel = 'Pending';
        statusVariant = 'secondary';
      }
    } else if (serviceName.toLowerCase() === 'augment') {
      const isBanned = getServiceField(alias.status, serviceName, 'isBanned');
      const register = getServiceField(alias.status, serviceName, 'register');

      if (isBanned === true) {
        statusLabel = 'Banned';
        statusIcon = <XCircle className="h-4 w-4" />;
        statusVariant = 'destructive';
      } else if (register === true) {
        statusLabel = 'Registered';
        statusIcon = <CheckCircle className="h-4 w-4" />;
        statusVariant = 'default';
      } else {
        statusLabel = 'Pending';
        statusVariant = 'secondary';
      }
    }

    return (
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {serviceName}
          </Badge>
          <Badge variant={statusVariant} className="flex items-center gap-1">
            {statusIcon}
            {statusLabel}
          </Badge>
        </div>
      </div>
    );
  };

  const services = Object.keys(alias.status);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            <span className="break-all">{alias.email}</span>
          </CardTitle>
          {!alias.countsTowardLimit && (
            <Badge variant="secondary" className="text-xs">
              Not counted
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created: {formatDate(alias.createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Service Statuses */}
        {services.length > 0 && (
          <section className="space-y-3">
            <Label>Service Status</Label>
            {services.map((serviceName) => (
              <div key={serviceName}>{renderServiceStatus(serviceName)}</div>
            ))}
          </section>
        )}

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
              <p className="min-h-[40px] rounded-md border p-3 text-sm">
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

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Cross-agency workflow templates
const WORKFLOW_TEMPLATES = {
  'joint_investigation': {
    name: 'Joint Investigation Workflow',
    agencies: ['osfi', 'fcac', 'provincial'],
    stages: [
      { stage: 'initiation', owner: 'primary_agency', duration_days: 5 },
      { stage: 'evidence_gathering', owner: 'all_agencies', duration_days: 15 },
      { stage: 'analysis', owner: 'lead_agency', duration_days: 10 },
      { stage: 'coordination_meeting', owner: 'primary_agency', duration_days: 2 },
      { stage: 'decision', owner: 'all_agencies', duration_days: 7 },
      { stage: 'enforcement', owner: 'relevant_agencies', duration_days: 30 }
    ]
  },
  'regulatory_approval': {
    name: 'Multi-Agency Regulatory Approval',
    agencies: ['osfi', 'fcac'],
    stages: [
      { stage: 'application_review', owner: 'primary_agency', duration_days: 10 },
      { stage: 'technical_assessment', owner: 'all_agencies', duration_days: 20 },
      { stage: 'stakeholder_consultation', owner: 'lead_agency', duration_days: 15 },
      { stage: 'final_review', owner: 'all_agencies', duration_days: 5 },
      { stage: 'decision_notification', owner: 'primary_agency', duration_days: 2 }
    ]
  },
  'compliance_monitoring': {
    name: 'Cross-Agency Compliance Monitoring',
    agencies: ['osfi', 'fcac', 'provincial'],
    stages: [
      { stage: 'data_collection', owner: 'all_agencies', duration_days: 7 },
      { stage: 'analysis_coordination', owner: 'lead_agency', duration_days: 5 },
      { stage: 'risk_assessment', owner: 'relevant_agencies', duration_days: 10 },
      { stage: 'action_planning', owner: 'all_agencies', duration_days: 3 },
      { stage: 'implementation', owner: 'relevant_agencies', duration_days: 21 }
    ]
  }
}

// Start cross-agency workflow
app.post('/workflows', async (c) => {
  const { env } = c
  const { 
    workflow_type, 
    case_id, 
    entity_id, 
    primary_agency, 
    involved_agencies,
    context 
  } = await c.req.json()
  
  try {
    const template = WORKFLOW_TEMPLATES[workflow_type]
    if (!template) {
      return c.json({ success: false, error: 'Invalid workflow type' })
    }
    
    // Create workflow instance
    const workflowResult = await env.DB.prepare(`
      INSERT INTO cross_agency_workflows (
        workflow_type, case_id, entity_id, primary_agency, 
        involved_agencies, status, created_at, context
      ) VALUES (?, ?, ?, ?, ?, 'initiated', CURRENT_TIMESTAMP, ?)
    `).bind(
      workflow_type,
      case_id,
      entity_id,
      primary_agency,
      JSON.stringify(involved_agencies),
      JSON.stringify(context)
    ).run()
    
    const workflowId = workflowResult.meta.last_row_id
    
    // Create workflow stages
    for (let i = 0; i < template.stages.length; i++) {
      const stage = template.stages[i]
      await env.DB.prepare(`
        INSERT INTO workflow_stages (
          workflow_id, stage_order, stage_name, owner_agency,
          status, estimated_duration_days, created_at
        ) VALUES (?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)
      `).bind(
        workflowId,
        i + 1,
        stage.stage,
        stage.owner,
        stage.duration_days
      ).run()
    }
    
    // Start first stage
    await startNextStage(env, workflowId)
    
    // Notify involved agencies
    await notifyAgencies(env, workflowId, involved_agencies, 'workflow_initiated')
    
    return c.json({
      success: true,
      data: {
        workflow_id: workflowId,
        workflow_type,
        stages_created: template.stages.length,
        next_stage: template.stages[0].stage,
        estimated_completion: calculateEstimatedCompletion(template.stages)
      }
    })
    
  } catch (error) {
    console.error('Workflow creation error:', error)
    return c.json({ success: false, error: 'Failed to create workflow' })
  }
})

// Get workflow status
app.get('/workflows/:workflowId', async (c) => {
  const { env } = c
  const workflowId = c.req.param('workflowId')
  
  const workflow = await env.DB.prepare(`
    SELECT * FROM cross_agency_workflows WHERE id = ?
  `).bind(workflowId).first()
  
  if (!workflow) {
    return c.json({ success: false, error: 'Workflow not found' })
  }
  
  const stages = await env.DB.prepare(`
    SELECT * FROM workflow_stages 
    WHERE workflow_id = ? 
    ORDER BY stage_order
  `).bind(workflowId).all()
  
  const notifications = await env.DB.prepare(`
    SELECT * FROM workflow_notifications 
    WHERE workflow_id = ? 
    ORDER BY sent_at DESC
    LIMIT 10
  `).bind(workflowId).all()
  
  return c.json({
    success: true,
    data: {
      workflow,
      stages: stages.results,
      recent_notifications: notifications.results,
      progress: calculateProgress(stages.results)
    }
  })
})

// Update workflow stage
app.post('/workflows/:workflowId/stages/:stageId/complete', async (c) => {
  const { env } = c
  const workflowId = c.req.param('workflowId')
  const stageId = c.req.param('stageId')
  const { notes, attachments, next_actions } = await c.req.json()
  
  try {
    // Update current stage
    await env.DB.prepare(`
      UPDATE workflow_stages 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP,
          completion_notes = ?, attachments = ?
      WHERE id = ? AND workflow_id = ?
    `).bind(
      notes,
      JSON.stringify(attachments || []),
      stageId,
      workflowId
    ).run()
    
    // Check if this was the last stage
    const remainingStages = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM workflow_stages 
      WHERE workflow_id = ? AND status != 'completed'
    `).bind(workflowId).first()
    
    if (remainingStages.count === 0) {
      // Complete workflow
      await env.DB.prepare(`
        UPDATE cross_agency_workflows 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(workflowId).run()
      
      await notifyWorkflowCompletion(env, workflowId)
    } else {
      // Start next stage
      await startNextStage(env, workflowId)
    }
    
    return c.json({
      success: true,
      data: {
        stage_completed: true,
        workflow_complete: remainingStages.count === 0
      }
    })
    
  } catch (error) {
    console.error('Stage completion error:', error)
    return c.json({ success: false, error: 'Failed to complete stage' })
  }
})

// Agency coordination dashboard
app.get('/coordination/dashboard/:agency', async (c) => {
  const { env } = c
  const agency = c.req.param('agency')
  
  // Active workflows for this agency
  const activeWorkflows = await env.DB.prepare(`
    SELECT w.*, ws.stage_name, ws.status as stage_status, ws.due_date
    FROM cross_agency_workflows w
    JOIN workflow_stages ws ON w.id = ws.workflow_id
    WHERE (w.primary_agency = ? OR JSON_EXTRACT(w.involved_agencies, '$[*]') LIKE '%' || ? || '%')
    AND w.status = 'active'
    AND ws.status = 'active'
    ORDER BY ws.due_date ASC
  `).bind(agency, agency).all()
  
  // Pending actions for this agency
  const pendingActions = await env.DB.prepare(`
    SELECT wa.*, w.workflow_type, w.case_id
    FROM workflow_actions wa
    JOIN cross_agency_workflows w ON wa.workflow_id = w.id
    WHERE wa.assigned_agency = ? AND wa.status = 'pending'
    ORDER BY wa.due_date ASC
  `).bind(agency).all()
  
  // Recent notifications
  const notifications = await env.DB.prepare(`
    SELECT * FROM workflow_notifications
    WHERE recipient_agency = ? AND read_at IS NULL
    ORDER BY sent_at DESC
    LIMIT 20
  `).bind(agency).all()
  
  // Coordination metrics
  const metrics = await calculateCoordinationMetrics(env, agency)
  
  return c.json({
    success: true,
    data: {
      active_workflows: activeWorkflows.results,
      pending_actions: pendingActions.results,
      unread_notifications: notifications.results,
      metrics,
      agency
    }
  })
})

// Inter-agency communication
app.post('/communication/send', async (c) => {
  const { env } = c
  const { 
    workflow_id, 
    sender_agency, 
    recipient_agencies, 
    message_type, 
    subject, 
    content,
    attachments 
  } = await c.req.json()
  
  try {
    // Create communication record
    const commResult = await env.DB.prepare(`
      INSERT INTO inter_agency_communications (
        workflow_id, sender_agency, message_type, subject, 
        content, attachments, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      workflow_id,
      sender_agency,
      message_type,
      subject,
      content,
      JSON.stringify(attachments || [])
    ).run()
    
    const communicationId = commResult.meta.last_row_id
    
    // Create recipient records
    for (const agency of recipient_agencies) {
      await env.DB.prepare(`
        INSERT INTO communication_recipients (
          communication_id, recipient_agency, status, created_at
        ) VALUES (?, ?, 'sent', CURRENT_TIMESTAMP)
      `).bind(communicationId, agency).run()
      
      // Send notification
      await env.DB.prepare(`
        INSERT INTO workflow_notifications (
          workflow_id, recipient_agency, notification_type,
          title, message, sent_at
        ) VALUES (?, ?, 'inter_agency_message', ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        workflow_id,
        agency,
        `Message from ${sender_agency}: ${subject}`,
        content.substring(0, 200) + (content.length > 200 ? '...' : '')
      ).run()
    }
    
    return c.json({
      success: true,
      data: {
        communication_id: communicationId,
        recipients_notified: recipient_agencies.length
      }
    })
    
  } catch (error) {
    console.error('Communication error:', error)
    return c.json({ success: false, error: 'Failed to send communication' })
  }
})

// Helper functions
async function startNextStage(env: any, workflowId: string) {
  const nextStage = await env.DB.prepare(`
    SELECT * FROM workflow_stages 
    WHERE workflow_id = ? AND status = 'pending'
    ORDER BY stage_order ASC
    LIMIT 1
  `).bind(workflowId).first()
  
  if (nextStage) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + nextStage.estimated_duration_days)
    
    await env.DB.prepare(`
      UPDATE workflow_stages 
      SET status = 'active', started_at = CURRENT_TIMESTAMP, due_date = ?
      WHERE id = ?
    `).bind(dueDate.toISOString(), nextStage.id).run()
    
    // Create workflow action for responsible agency
    await env.DB.prepare(`
      INSERT INTO workflow_actions (
        workflow_id, stage_id, assigned_agency, action_type,
        description, status, due_date, created_at
      ) VALUES (?, ?, ?, 'stage_completion', ?, 'pending', ?, CURRENT_TIMESTAMP)
    `).bind(
      workflowId,
      nextStage.id,
      nextStage.owner_agency,
      `Complete ${nextStage.stage_name} stage`,
      dueDate.toISOString()
    ).run()
  }
}

async function notifyAgencies(env: any, workflowId: string, agencies: string[], notificationType: string) {
  for (const agency of agencies) {
    await env.DB.prepare(`
      INSERT INTO workflow_notifications (
        workflow_id, recipient_agency, notification_type,
        title, message, sent_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      workflowId,
      agency,
      notificationType,
      'New Cross-Agency Workflow Initiated',
      `A new cross-agency workflow has been initiated. Please review your coordination dashboard.`
    ).run()
  }
}

function calculateEstimatedCompletion(stages: any[]) {
  const totalDays = stages.reduce((sum, stage) => sum + stage.duration_days, 0)
  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + totalDays)
  return completionDate.toISOString()
}

function calculateProgress(stages: any[]) {
  const completed = stages.filter(s => s.status === 'completed').length
  const total = stages.length
  return {
    completed_stages: completed,
    total_stages: total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

async function notifyWorkflowCompletion(env: any, workflowId: string) {
  const workflow = await env.DB.prepare(`
    SELECT * FROM cross_agency_workflows WHERE id = ?
  `).bind(workflowId).first()
  
  if (workflow) {
    const agencies = JSON.parse(workflow.involved_agencies)
    for (const agency of agencies) {
      await env.DB.prepare(`
        INSERT INTO workflow_notifications (
          workflow_id, recipient_agency, notification_type,
          title, message, sent_at
        ) VALUES (?, ?, 'workflow_completed', ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        workflowId,
        agency,
        'Cross-Agency Workflow Completed',
        `The ${workflow.workflow_type} workflow has been completed successfully.`
      ).run()
    }
  }
}

async function calculateCoordinationMetrics(env: any, agency: string) {
  // Active workflows count
  const activeCount = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM cross_agency_workflows
    WHERE (primary_agency = ? OR JSON_EXTRACT(involved_agencies, '$[*]') LIKE '%' || ? || '%')
    AND status = 'active'
  `).bind(agency, agency).first()
  
  // Average completion time
  const avgCompletion = await env.DB.prepare(`
    SELECT AVG(julianday(completed_at) - julianday(created_at)) as avg_days
    FROM cross_agency_workflows
    WHERE (primary_agency = ? OR JSON_EXTRACT(involved_agencies, '$[*]') LIKE '%' || ? || '%')
    AND status = 'completed'
    AND created_at >= date('now', '-90 days')
  `).bind(agency, agency).first()
  
  return {
    active_workflows: activeCount.count,
    average_completion_days: Math.round(avgCompletion.avg_days || 0),
    agency_collaboration_score: calculateCollaborationScore(activeCount.count)
  }
}

function calculateCollaborationScore(activeWorkflows: number) {
  // Simple scoring based on active coordination
  if (activeWorkflows >= 10) return 'excellent'
  if (activeWorkflows >= 5) return 'good' 
  if (activeWorkflows >= 2) return 'moderate'
  return 'limited'
}

export default app
import { writeFile } from 'node:fs/promises';
import { modelCatalog } from '../src/modelCatalog.mjs';
import { permissionMatrix } from '../src/permissionMatrix.mjs';
import { workflows } from '../src/workflows.mjs';

const modelDocUrl = new URL('../../../docs/cangqiong-form-models.md', import.meta.url);
const permissionDocUrl = new URL('../../../docs/cangqiong-permission-matrix.md', import.meta.url);
const workflowDocUrl = new URL('../../../docs/cangqiong-application-workflows.md', import.meta.url);
const blueprintUrl = new URL('../exports/fitjob-cangqiong-blueprint.json', import.meta.url);

function escapeCell(value) {
    return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function serializeLines(lines) {
    return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}

function fieldRules(item) {
    const rules = [];
    if (item.primaryKey) rules.push('主键');
    if (item.unique) rules.push('唯一');
    if (item.uniqueWithinParent) rules.push('父单据内唯一');
    if (item.readonly) rules.push('只读');
    if (item.serverGenerated) rules.push('服务端生成');
    if (item.serverDerived) rules.push(`服务端派生：${item.serverDerived}`);
    if (item.immutableAfterCreate) rules.push('创建后不可变');
    if (item.masked) rules.push('列表脱敏');
    if (item.length) rules.push(`长度 ${item.length}`);
    if (item.maxLength) rules.push(`最长 ${item.maxLength}`);
    if (item.min !== undefined) rules.push(`最小 ${item.min}`);
    if (item.max !== undefined) rules.push(`最大 ${item.max}`);
    if (item.minItems) rules.push(`至少 ${item.minItems} 项`);
    if (item.maxItems) rules.push(`最多 ${item.maxItems} 项`);
    if (item.precision) rules.push(`精度 ${item.precision}`);
    if (item.enum) rules.push(`枚举：${item.enum.join(' / ')}`);
    if (item.reference) rules.push(`关联 ${item.reference}`);
    if (item.default !== undefined) rules.push(`默认 ${item.default}`);
    if (item.sensitivity) rules.push(`敏感级别 ${item.sensitivity}`);
    return rules.join('；') || '—';
}

function renderFields(fields) {
    const rows = fields.map((item) => [
        `\`${item.code}\``,
        item.label,
        `\`${item.type}\``,
        `\`${modelCatalog.javaTypeMap[item.type]}\``,
        item.required ? '是' : '否',
        fieldRules(item)
    ]);
    return [
        '| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |',
        '| --- | --- | --- | --- | --- | --- |',
        ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`)
    ].join('\n');
}

const modelLines = [
    '# Fit Job 苍穹低代码表单模型设计',
    '',
    '> 由 `platform/cangqiong/src/modelCatalog.mjs` 生成。字段编码是平台配置与后续 Java DTO 的统一基线；目标租户首次创建后，如平台实际编码发生变化，应同步修改源码并重新生成本文档。',
    '',
    `- 蓝图版本：\`${modelCatalog.schemaVersion}\``,
    `- 应用编码：\`${modelCatalog.appCode}\``,
    `- 表单模型：${modelCatalog.models.length} 个`,
    `- 登录角色：${modelCatalog.roles.map((role) => `\`${role}\``).join('、')}`,
    '',
    '## 模型总览',
    '',
    '| 编码 | 名称 | 单据编号字段 | 状态字段 | 初始状态 |',
    '| --- | --- | --- | --- | --- |',
    ...modelCatalog.models.map((model) => `| \`${model.code}\` | ${model.name} | \`${model.numberField}\` | \`${model.status.field}\` | \`${model.status.initial}\` |`)
];

for (const model of modelCatalog.models) {
    modelLines.push(
        '',
        `## ${model.name}（\`${model.code}\`）`,
        '',
        `页面：列表 \`${model.ui.listPage}\`，表单 \`${model.ui.formPage}\`；模式：${model.ui.supportedModes.map((mode) => `\`${mode}\``).join('、')}。`,
        '',
        `状态枚举：${model.status.values.map((status) => `\`${status}\``).join('、')}`,
        '',
        renderFields(model.fields)
    );

    for (const detail of model.detailTables) {
        modelLines.push(
            '',
            `### 子表：${detail.name}（\`${detail.code}\`）`,
            '',
            detail.minRows ? `至少 ${detail.minRows} 行。` : '允许零到多行。',
            '',
            renderFields(detail.fields)
        );
    }

    modelLines.push('', '### 关联关系', '');
    if (model.relationships.length === 0) {
        modelLines.push('无跨表关联。');
    } else {
        modelLines.push(
            '| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |',
            '| --- | --- | --- | --- | --- |',
            ...model.relationships.map((relation) => `| \`${relation.field}\` | \`${relation.target}\` | \`${relation.targetField || 'id'}\` | \`${relation.cardinality}\` | \`${relation.onDelete || '平台默认'}\` |`)
        );
    }
    if (model.constraints.length > 0) {
        modelLines.push('', '### 业务约束', '');
        model.constraints.forEach((constraint) => {
            modelLines.push(`- \`${constraint.code}\`（\`${constraint.type}\`）：${constraint.rule}`);
        });
    }
}

modelLines.push(
    '',
    '## 服务与流程关联',
    '',
    '| 编码 | 能力 | 输入 | 写入/创建 |',
    '| --- | --- | --- | --- |',
    ...modelCatalog.serviceBindings.map((binding) => `| \`${binding.code}\` | ${binding.label} | ${binding.inputs.map((item) => `\`${item}\``).join('、')} | ${binding.writes?.map((item) => `\`${item}\``).join('、') || `创建 \`${binding.creates}\`，启动 \`${binding.workflow}\``} |`),
    '',
    '岗位推荐过滤：`fit_job.publishStatus == PUBLISHED && fit_job.recommendationEnabled == true`。',
    '',
    '## Java DTO 约定',
    '',
    '- 表单字段以 camelCase 编码直接映射 Java 属性。',
    '- 枚举字段在第一版 DTO 中使用 `String`，Java 服务稳定后可提升为显式枚举并保留未知值兼容。',
    '- 主子表映射为 `List<DetailDTO>`；引用字段先使用业务编号 `String`，避免把苍穹内部主键泄漏到服务边界。',
    '- 日期分别使用 `LocalDate` 和 `OffsetDateTime`；金额与评分小数使用 `BigDecimal`。',
    '- `structuredContent`、`resultJson` 使用 `JsonNode`，并在 Java 服务入口执行结构校验。',
    '- 审批状态、当前处理人和审批记录只能由流程操作写入，DTO 更新接口不得接受客户端直接覆盖。',
    ''
);

const roleLabels = Object.fromEntries(Object.entries(permissionMatrix.roles).map(([code, role]) => [code, role.label]));
const permissionLines = [
    '# Fit Job 四类角色权限矩阵',
    '',
    '> 由 `platform/cangqiong/src/permissionMatrix.mjs` 生成。菜单隐藏不是权限边界；表单、操作和服务模型必须重复执行数据范围校验。',
    '',
    '## 角色与数据范围',
    '',
    '| 角色编码 | 角色 | 绑定方式 | 默认范围 |',
    '| --- | --- | --- | --- |',
    ...Object.entries(permissionMatrix.roles).map(([code, role]) => `| \`${code}\` | ${role.label} | ${role.assignment} | \`${role.defaultScope}\` |`),
    '',
    '## 菜单权限',
    '',
    `| 菜单 | ${Object.keys(roleLabels).map((role) => roleLabels[role]).join(' | ')} |`,
    `| --- | ${Object.keys(roleLabels).map(() => '---').join(' | ')} |`,
    ...permissionMatrix.menus.map((menu) => `| ${menu.label}<br>\`${menu.code}\` | ${Object.keys(roleLabels).map((role) => menu.roles.includes(role) ? '✓' : '—').join(' | ')} |`),
    '',
    '## 表单、操作、按钮与数据范围',
    '',
    '| 表单模型 | 角色 | 允许操作 | 按钮 | 默认数据范围 | 操作范围覆盖 | 状态条件 |',
    '| --- | --- | --- | --- | --- | --- | --- |'
];

for (const [modelCode, matrix] of Object.entries(permissionMatrix.models)) {
    for (const [role, decision] of Object.entries(matrix)) {
        const actionScopes = decision.actionScopes
            ? Object.entries(decision.actionScopes).map(([action, scope]) => `\`${action}\`→\`${scope}\``).join('、')
            : '—';
        const actionConditions = decision.actionConditions
            ? Object.entries(decision.actionConditions).map(([action, condition]) => `\`${action}\`：${condition}`).join('<br>')
            : '—';
        permissionLines.push(`| \`${modelCode}\` | ${roleLabels[role]} | ${decision.actions.length ? decision.actions.map((item) => `\`${item}\``).join('、') : '禁止'} | ${decision.buttons?.length ? decision.buttons.map((item) => `\`${item}\``).join('、') : '—'} | \`${decision.dataScope}\` | ${actionScopes} | ${actionConditions} |`);
    }
}

permissionLines.push('', '## 数据过滤表达式', '', '| 范围编码 | 配置语义 |', '| --- | --- |');
for (const [scope, expression] of Object.entries(permissionMatrix.dataScopes)) {
    permissionLines.push(`| \`${scope}\` | ${expression} |`);
}

permissionLines.push('', '## 字段级权限', '');
permissionMatrix.fieldRules.forEach((rule) => {
    permissionLines.push(`- ${rule.models.map((model) => `\`${model}\``).join('、')} 的 ${rule.fields.map((field) => `\`${field}\``).join('、')}：${rule.rule}`);
});
permissionLines.push('', '## 隔离验收用例', '');
permissionMatrix.segregationAcceptanceCases.forEach((item) => permissionLines.push(`- [ ] ${item}`));
permissionLines.push('', '> 平台角色登录截图清单见 `platform/cangqiong/evidence/README.md`；本地蓝图不能替代真实租户登录验证。', '');

const workflowLines = [
    '# Fit Job 苍穹流程模型设计',
    '',
    '> 由 `platform/cangqiong/src/workflows.mjs` 生成。`workflowEngine.mjs` 是状态、角色、意见必填和幂等规则的本地可执行参考，正式运行时应映射到苍穹流程模型及服务端操作。',
    ''
];

for (const workflow of workflows) {
    workflowLines.push(
        `## ${workflow.name}（\`${workflow.code}\`）`,
        '',
        `- 业务表单：\`${workflow.model}\``,
        `- 状态字段：\`${workflow.statusField}\``,
        `- 初始状态：\`${workflow.initialStatus}\``,
        `- 终态：${workflow.terminalStatuses.map((status) => `\`${status}\``).join('、')}`,
        '',
        '### 节点与处理人',
        '',
        '| 状态/节点 | 名称 | 处理角色 | 处理人解析 |',
        '| --- | --- | --- | --- |',
        ...Object.entries(workflow.nodes).map(([status, node]) => `| \`${status}\` | ${node.label} | ${node.handlerRole ? escapeCell(Array.isArray(node.handlerRole) ? node.handlerRole.join(' / ') : node.handlerRole) : '系统终态'} | \`${node.handlerResolver || '—'}\` |`),
        '',
        '### 状态迁移',
        '',
        '| 动作 | 来源状态 | 目标状态 | 执行角色 | 处理人覆盖 | 意见必填 | 必填字段/额外校验 |',
        '| --- | --- | --- | --- | --- | --- | --- |',
        ...workflow.transitions.map((item) => {
            const guards = [
                item.requiredFields.length ? item.requiredFields.map((field) => `\`${field}\``).join('、') : null,
                Object.keys(item.requiredEquals).length ? `固定值：${Object.entries(item.requiredEquals).map(([field, value]) => `\`${field}=${value}\``).join('、')}` : null,
                item.linkedRecordRequirements.length ? `关联校验：${item.linkedRecordRequirements.map((rule) => `\`${rule.contextKey}.${rule.statusField}=${rule.requiredStatus}\``).join('、')}` : null
            ].filter(Boolean).join('<br>') || '—';
            return `| \`${item.action}\` ${item.label} | ${item.from.map((status) => `\`${status}\``).join(' / ')} | \`${item.to}\` | ${item.roles.map((role) => `\`${role}\``).join(' / ')} | ${item.handlerOverrideRoles.length ? item.handlerOverrideRoles.map((role) => `\`${role}\``).join(' / ') : '—'} | ${item.commentRequired ? '是' : '否'} | ${guards} |`;
        }),
        ''
    );
}

workflowLines.push(
    '## Issue #18 主链验收',
    '',
    '```mermaid',
    'flowchart LR',
    '    A["学生提交"] --> B["辅导员审核"]',
    '    B --> C["院系审核"]',
    '    C --> D["企业确认"]',
    '    D --> E["审批完成"]',
    '    B -->|退回并填写意见| R["学生修改"]',
    '    C -->|退回并填写意见| R',
    '    D -->|退回并填写意见| R',
    '    R --> A',
    '```',
    '',
    '- 每次动作写入 `approvalRecords`，包含处理人、角色、来源状态、目标状态、意见、时间和幂等命令编号。',
    '- 退回、拒绝、企业确认和录用动作强制填写意见。',
    '- `createCommandId` 只标识创建操作，`approvalRecords.commandId` 标识每次提交/重提；同一提交命令回放原结果，新命令才允许 `RETURNED → SUBMITTED`。',
    '- 平台通过唯一 `activeApplicationKey` 原子阻止并发重复申请；宿主在一次网络重试链中必须复用同一组命令编号。',
    '- 实习提交必须加载状态为 `OFFERED` 的关联岗位申请，并核对学生、岗位、企业与简历完全一致。',
    '- 实际苍穹流程截图和四角色处理记录应按证据清单归档。',
    ''
);

await Promise.all([
    writeFile(modelDocUrl, serializeLines(modelLines), 'utf8'),
    writeFile(permissionDocUrl, serializeLines(permissionLines), 'utf8'),
    writeFile(workflowDocUrl, serializeLines(workflowLines), 'utf8'),
    writeFile(blueprintUrl, `${JSON.stringify({ modelCatalog, permissionMatrix, workflows }, null, 2)}\n`, 'utf8')
]);

console.log('Generated Cangqiong blueprint JSON and model, permission and workflow documentation.');

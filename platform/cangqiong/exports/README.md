# 苍穹配置导出物

`fitjob-cangqiong-blueprint.json` 由 `npm run docs` 从三个唯一配置源稳定生成：

- `src/modelCatalog.mjs`
- `src/permissionMatrix.mjs`
- `src/workflows.mjs`

该 JSON 用于代码审查、Java DTO 生成和平台配置核对，不声称是某个未确认版本的苍穹专有导入包。取得目标租户和官方导出格式后，应将平台允许提交的真实导出物另行放入本目录，并在证据清单中记录平台版本与导出日期。

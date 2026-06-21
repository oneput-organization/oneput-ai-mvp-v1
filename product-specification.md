Core Features
Divide into modules, each under various category

Setup
Module 1: Framework & Setup
เลือก standard/framework ที่ต้องการ focus เช่น GRI, IFRS S1, IFRS S2, SEC 56-1
Company overview -> กรอกข้อมูลเบื้องต้นเกี่ยวกับบริษัท 

Data Collection
Module 2: ESG Metrics Registry
เนื่องจาก Standard หรือ Framework ต่างๆ อาจมีการเปลี่ยนแปลงได้ทุกปี จึงจำเป็นต้องมี Central Registry ตรงกลาง เพื่อเก็บว่ามี Metric อะไรที่ใช้งานได้บ้าง
แต่ละ Metric จะ Map กับแต่ละ Standard/Framework และ Metric หนึ่งสามารถ Map ได้หลายอัน
Module 3: Data Collection
Assign แต่ละ Metric ให้กับเจ้าของข้อมูลแต่ละรายได้อัตโนมัติ (ตาม Role) หรือแบบ manual
สามารถกรอกข้อมูลได้ทั้งแบบ Manual, ผ่าน CSV, API Integration เข้ากับ ERP หรือ software อื่น
มีการ Validate ความถูกต้องของทุกข้อมูลเสมอ
Flow คือ Data Owner -> Reviewer -> Approved

Module 4: Chatbot
Oneput AI An AI teammate that collects your ESG data all year. Most ESG work isn't writing the report. It's chasing numbers out of every department. Oneput AI does that chasing for you. 
What it does Asks for what's needed. At the start of the year, it tells each department exactly what data to send and when. The list is built automatically from your reporting frameworks (IFRS S1/S2, 56-1, GRI), then fine-tuned for your company. Chases automatically. It lives in LINE or wherever your team works and follows up on its own schedule, so nothing piles up at year-end. If someone's late, it nudges their manager. 

Report
Module 5: Report Builder
มี Template ในการสร้างรายงานที่ Comply กับ standard ต่างๆ เช่น IFRS S1
ผู้ใช้สามารถเขียนรายงานเพิ่มเติมหรือแก้ไขได้ด้วย Text Editor บนแพลตฟอร์ม
สามารถดึงข้อมูลตัวเลขจากตัวแปรได้
Module 6: Export & Compliance
สามารถ Export รายงานเป็น PDF/Word/อื่นๆ ได้
ระบบจะสร้างเอกสารประกอบการเปิดเผยข้อมูลเพื่อใช้อ้างอิงไว้ด้วยโดยอัตโนมัติ โดยอ้างอิงจากข้อมูลบนแพลตฟอร์ม   


Non-Core Features
List คร่าวๆ ยังไม่รู้จะไปใส่ตรงไหน
มีการแยก Role และมี permission matrix ว่าแต่ละ role ทำอะไรได้บ้าง
มี Audit Log ของทุกการกระทำ
มีหน้า Dashboard แสดง progress และสถานะของข้อมูล แต่ต้องดูง่ายไม่เยอะเหมือนอันเก่า
เพิ่มเติมจาก API Integration หลักๆ คือควรต่อเข้า SAP, Oracle ได้
CSV ต้องมีการกำหนด format ชัดเจนรวมถึงหลักการในการ validate ในแต่ละ metric



Role

Role
วัตถุประสงค์
สิทธิ์การเข้าถึง (Access)
สิ่งที่ทำได้
Admin
ผู้ดูแลระบบและเจ้าของแพลตฟอร์มฝั่งลูกค้า
ทุก Module ในระบบ
จัดการผู้ใช้งาน, กำหนด Role, ตั้งค่ามาตรฐาน (GRI, IFRS S1), สร้างและแก้ไข Material Topics, สร้างและแก้ไข ESG Metrics, ดูข้อมูลทุกหน่วยงาน, จัดการ Report Template, Export รายงาน, Publish รายงาน
Contributor
ผู้ส่งข้อมูล ESG และผู้จัดทำรายงาน ซึ่งอาจจะเป็นคนจากแต่ละ BU
เฉพาะข้อมูลและรายงานที่ได้รับมอบหมาย
รับ Data Request, กรอกข้อมูล ESG, Upload CSV, แก้ไขข้อมูลก่อนอนุมัติ, ดูสถานะการส่งข้อมูล, เขียนและแก้ไขเนื้อหารายงาน, แทรกข้อมูลลงในรายงาน, ตอบ Comment จาก Reviewer
Reviewer / Internal Auditor
ผู้ตรวจสอบความถูกต้องของข้อมูล ESG และเนื้อหารายงาน
ข้อมูลและรายงานที่ถูก Assign ให้ตรวจสอบ
ดูข้อมูลที่ส่งเข้ามา, ตรวจสอบข้อมูล, Approve หรือ Reject ข้อมูล, ส่ง Comment กลับให้แก้ไข, ตรวจสอบ Draft Report, Approve หรือ Reject Section ของรายงาน
Approver
ผู้อนุมัติรายงานขั้นสุดท้ายก่อนเผยแพร่
ข้อมูลและรายงานทั้งหมดแบบ Read-only
ดู Dashboard สรุปผล, ดู Compliance Status, ดูรายงานฉบับสมบูรณ์, Approve หรือ Reject รายงาน, ให้ Comment หรือข้อเสนอแนะ
External Auditor 
ผู้สอบทานหรือ Assurance Provider ภายนอก
Read-only ตาม Scope ที่ได้รับอนุญาต
ดูข้อมูลต้นทาง, ดู Audit Trail, ดาวน์โหลด Evidence Package, ตรวจสอบเอกสารประกอบ, บันทึก Observation หรือ Finding


Data Model
แบบคร่าวๆ





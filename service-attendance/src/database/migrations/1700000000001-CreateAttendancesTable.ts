import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAttendancesTable1700000000001 implements MigrationInterface {
  name = 'CreateAttendancesTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attendances',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'employee_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'employee_code',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'employee_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['CLOCK_IN', 'CLOCK_OUT'],
            isNullable: false,
          },
          {
            name: 'photo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'clock_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'clock_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            default: "'PENDING'",
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Unique constraint: 1 clock-in and 1 clock-out per employee per day
    await queryRunner.createIndex(
      'attendances',
      new TableIndex({
        name: 'UQ_ATTENDANCE_EMPLOYEE_DATE_TYPE',
        columnNames: ['employee_id', 'clock_date', 'type'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'attendances',
      new TableIndex({
        name: 'IDX_ATTENDANCE_CLOCK_DATE',
        columnNames: ['clock_date'],
      }),
    );

    await queryRunner.createIndex(
      'attendances',
      new TableIndex({
        name: 'IDX_ATTENDANCE_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('attendances', true);
  }
}

import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { UpdateDoctorProfileDto } from './dto/create-doctor.dto';
import { CreateDoctorScheduleDto } from './dto/update-schedule.dto';
import { CreateMedicalRecordDto } from './dto/create-note.dto';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post(':userId/profile')
  createProfile(@Param('userId') userId: string, @Body() dto: UpdateDoctorProfileDto) {
    return this.doctorService.createProfile(userId, dto);
  }

  @Get(':userId/profile')
  getProfile(@Param('userId') userId: string) {
    return this.doctorService.getProfile(userId);
  }

  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  @Get('profile/:id')
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Post(':id/schedule')
  updateSchedule(@Param('id') id: string, @Body() dto: CreateDoctorScheduleDto) {
    return this.doctorService.updateSchedule(id, dto);
  }

  @Delete(':id/schedule/:scheduleId')
  deleteSchedule(@Param('id') id: string, @Param('scheduleId') scheduleId: string) {
    return this.doctorService.deleteSchedule(id, scheduleId);
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string) {
    return this.doctorService.getSchedule(id);
  }

  @Get(':id/appointments/past')
  getPastAppointments(@Param('id') id: string) {
    return this.doctorService.getPastAppointments(id);
  }

  @Get(':id/patients/:patientId/history')
  getPatientHistory(@Param('id') id: string, @Param('patientId') patientId: string) {
    return this.doctorService.getPatientHistory(id, patientId);
  }

  @Post(':id/consultation-notes')
  addConsultationNote(@Param('id') id: string, @Body() dto: CreateMedicalRecordDto) {
    return this.doctorService.addConsultationNote(id, dto);
  }

  @Post(':id/appointments/:appointmentId/join')
  joinSession(@Param('id') id: string, @Param('appointmentId') appointmentId: string) {
    return this.doctorService.joinSession(id, appointmentId);
  }
}

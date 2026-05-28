import { Controller, Post, Get, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { UpdateDoctorProfileDto } from './dto/create-doctor.dto';
import { CreateDoctorScheduleDto } from './dto/update-schedule.dto';
import { CreateMedicalRecordDto } from './dto/create-note.dto';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post(':userId/profile')
  createProfile(@Param('userId', ParseUUIDPipe) userId: string, @Body() dto: UpdateDoctorProfileDto) {
    return this.doctorService.createProfile(userId, dto);
  }

  @Get(':userId/profile')
  getProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.doctorService.getProfile(userId);
  }

  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  @Get('profile/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.findOne(id);
  }

  @Post(':id/schedule')
  updateSchedule(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateDoctorScheduleDto) {
    return this.doctorService.updateSchedule(id, dto);
  }

  @Delete(':id/schedule/:scheduleId')
  deleteSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
  ) {
    return this.doctorService.deleteSchedule(id, scheduleId);
  }

  @Get(':id/schedule')
  getSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.getSchedule(id);
  }

  @Get(':id/appointments/past')
  getPastAppointments(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.getPastAppointments(id);
  }

  @Get(':id/appointments/upcoming')
  getUpcomingAppointments(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.getUpcomingAppointments(id);
  }

  @Get(':id/patients/:patientId/history')
  getPatientHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.doctorService.getPatientHistory(id, patientId);
  }

  @Post(':id/consultation-notes')
  addConsultationNote(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateMedicalRecordDto) {
    return this.doctorService.addConsultationNote(id, dto);
  }

  @Post(':id/appointments/:appointmentId/join')
  joinSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.doctorService.joinSession(id, appointmentId);
  }
}

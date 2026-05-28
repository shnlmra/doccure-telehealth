import { Controller, Post, Get, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { PatientService } from './patient.service';
import { UpdatePatientProfileDto } from './dto/create-patient.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AskAiDto } from './dto/ask-ai.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post(':userId/profile')
  createProfile(@Param('userId', ParseUUIDPipe) userId: string, @Body() dto: UpdatePatientProfileDto) {
    return this.patientService.createProfile(userId, dto);
  }

  @Get(':userId/profile')
  getProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.patientService.getProfile(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.findOne(id);
  }

  @Post(':id/update')
  updateProfile(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePatientProfileDto) {
    return this.patientService.updateProfileById(id, dto);
  }

  @Post(':id/appointments')
  bookAppointment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: BookAppointmentDto) {
    return this.patientService.bookAppointment(id, dto);
  }

  @Post(':id/appointments/:appointmentId/cancel')
  cancelAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.patientService.cancelAppointment(id, appointmentId);
  }

  @Post(':id/appointments/:appointmentId/reschedule')
  rescheduleAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body('newScheduleId', ParseUUIDPipe) newScheduleId: string,
  ) {
    return this.patientService.rescheduleAppointment(id, appointmentId, newScheduleId);
  }

  @Get(':id/appointments')
  getAppointments(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.getAppointments(id);
  }

  @Post(':id/ai-recommendations')
  askAi(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AskAiDto) {
    return this.patientService.askAi(id, dto);
  }

  @Get(':id/ai-recommendations')
  getRecommendations(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.getRecommendations(id);
  }

  @Get('notifications/:userId')
  getNotifications(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.patientService.getNotifications(userId);
  }

  @Patch('notifications/:userId/:notifId/read')
  readNotification(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('notifId', ParseUUIDPipe) notifId: string,
  ) {
    return this.patientService.readNotification(userId, notifId);
  }

  @Get(':id/medical-records')
  getMedicalRecords(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.getMedicalRecords(id);
  }

  @Post(':id/appointments/:appointmentId/join')
  joinSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.patientService.joinSession(id, appointmentId);
  }
}
